const duffel = require('../services/duffelService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');

// ─────────────────────────────────────────────────────────────────────────
// 1. AIRPORT SEARCH (PLACES API)
// ─────────────────────────────────────────────────────────────────────────
const getAirports = async (req, res) => {
  try {
    const { lat, lng, rad, q } = req.query;
    let params = {};
    if (lat && lng) {
      params.lat = parseFloat(lat);
      params.lng = parseFloat(lng);
      if (rad) params.rad = parseInt(rad);
    } else if (q) {
      params.query = q;
    } else {
      return res.status(400).json({ message: 'Provide ?q=SearchTerm or ?lat=..&lng=..' });
    }
    const suggestions = await duffel.suggestions.list(params);
    const mapped = suggestions.data.map(p => ({
      airport_name: p.name,
      iata_code: p.iata_code,
      city_name: p.city_name,
      coordinates: { latitude: p.latitude, longitude: p.longitude }
    }));
    res.json({ data: mapped });
  } catch (error) {
    res.status(500).json({ message: 'Flight suggestions failed', details: error.errors || error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// 2. SEARCH FLIGHTS — Private Fares + Loyalty Programme Accounts
// ─────────────────────────────────────────────────────────────────────────
const searchFlights = async (req, res) => {
  try {
    const {
      origin, destination, departure_date, return_date,
      adults, children,
      cabin_class, max_connections,
      private_fares,              // { "BA": [{ corporate_code: "CORP123" }], "AA": [{ tracking_reference: "AA789" }] }
      airline_credit_ids,
      loyalty_programme_accounts, // [{ airline_iata_code: "QF", account_number: "12345" }]
    } = req.body;

    if (!origin || !destination || !departure_date || !adults)
      return res.status(400).json({ message: 'Missing required fields' });

    // Build passengers, attaching loyalty accounts per the Duffel spec
    const passengers = [];
    for (let i = 0; i < parseInt(adults); i++)
      passengers.push({
        type: 'adult',
        ...(loyalty_programme_accounts?.length ? { loyalty_programme_accounts } : {})
      });
    for (let i = 0; i < parseInt(children || 0); i++)
      passengers.push({ type: 'child' });

    const slices = [{ origin, destination, departure_date }];
    if (return_date) slices.push({ origin: destination, destination: origin, departure_date: return_date });

    const requestPayload = {
      return_offers: true,
      slices,
      passengers,
      cabin_class: cabin_class || 'economy',
      supplier_timeout: 30000,
      max_connections: max_connections !== undefined ? parseInt(max_connections) : undefined,
    };

    if (private_fares && typeof private_fares === 'object')
      requestPayload.private_fares = private_fares;

    if (airline_credit_ids && Array.isArray(airline_credit_ids))
      requestPayload.airline_credit_ids = airline_credit_ids;

    const offerRequest = await duffel.offerRequests.create(requestPayload);
    let limitedOffers = (offerRequest.data.offers || []).slice(0, 50);

    // Apply ZamGo Markup to each offer instantly
    limitedOffers = limitedOffers.map(offer => {
      const base = parseFloat(offer.total_amount);
      let markup = 30;
      if (base < 70) markup = 10;
      else if (base < 100) markup = 15;
      
      return {
        ...offer,
        total_amount: (base + markup).toFixed(2),
        base_amount_original: base.toFixed(2),
        margin_applied: markup
      };
    });

    res.json({
      data: {
        offer_request_id: offerRequest.data.id,
        passengers: offerRequest.data.passengers,
        offers: limitedOffers
      }
    });
  } catch (error) {
    console.error('Duffel Search Error:', error.message);
    res.status(500).json({ message: 'Flight search failed', details: error.errors || error.message });
  }
};
// ─────────────────────────────────────────────────────────────────────────
// 2b. PRICE CHECK + MARKUP (GET /api/duffel/price-check)
//     Returns final price after applying ZamGo margin
//     Body: { offer_id, markup_percent (default 10), markup_fixed (default 0) }
// ─────────────────────────────────────────────────────────────────────────
const priceCheck = async (req, res) => {
  try {
    const { offer_id } = req.body;
    if (!offer_id) return res.status(400).json({ message: 'offer_id required' });

    // Fetch latest pricing + available services in one call
    const offer = await duffel.offers.get(offer_id, { return_available_services: true });
    const { total_amount, total_currency, conditions } = offer.data;

    const base = parseFloat(total_amount);

    // ZamGo Tiered Markup Logic
    let markup = 30;
    if (base < 70) markup = 10;
    else if (base < 100) markup = 15;

    const finalPrice = (base + markup).toFixed(2);

    res.json({
      data: {
        base_price: base.toFixed(2),
        zamgo_markup: markup,
        total_to_charge: finalPrice,
        currency: total_currency,
        markup_tier: base < 100 ? 'budget (<100)' : base < 500 ? 'mid (100-500)' : 'premium (500+)',
        refundable: conditions?.refund_before_departure !== null,
        changeable: conditions?.change_before_departure !== null,
        airline_credits: offer.data.available_airline_credit_ids || [],
        available_services: offer.data.available_services || []
      }
    });
  } catch (error) {
    console.error('Price Check Error:', error.message);
    res.status(422).json({ message: 'Offer expired or price changed', details: error.errors || error.message });
  }
};

//    Uses return_available_services: true for latest service pricing
// ─────────────────────────────────────────────────────────────────────────
const getOffer = async (req, res) => {
  try {
    const offerId = req.params.id;

    // Duffel doc: pass return_available_services to get seat/bag catalog
    const offer = await duffel.offers.get(offerId, { return_available_services: true });
    const { total_amount, total_currency, slices, conditions } = offer.data;

    const parseCondition = (cond) => {
      if (!cond || cond.allowed === undefined) return 'Rules unavailable';
      if (!cond.allowed) return 'Not allowed';
      if (cond.allowed && !cond.penalty_amount) return 'Free';
      if (cond.allowed && cond.penalty_amount > 0) return `Allowed with penalty (${cond.penalty_currency} ${cond.penalty_amount})`;
      return 'Unknown';
    };

    const parsedConditions = {
      change: parseCondition(conditions?.change_before_departure),
      refund: parseCondition(conditions?.refund_before_departure),
      is_refundable: conditions?.refund_before_departure !== null,
      is_changeable: conditions?.change_before_departure !== null,
    };

    const formattedSlices = slices.map(slice => ({
      duration: slice.duration,
      stops: slice.segments.length > 1 ? slice.segments.length - 1 : 0,
      origin: slice.origin.iata_code,
      destination: slice.destination.iata_code,
      segments: slice.segments.map(seg => ({
        airport_name_from: seg.origin.name,
        city_from: seg.origin.city_name,
        departure_time: seg.departing_at,
        airport_name_to: seg.destination.name,
        city_to: seg.destination.city_name,
        arrival_time: seg.arriving_at,
        duration: seg.duration,
        airline: seg.marketing_carrier.name,
        flight_number: seg.marketing_carrier_flight_number
      }))
    }));

    // ZamGo Tiered Markup Logic (re-applied to retain markup in checkout)
    const base = parseFloat(total_amount);
    let markup = 30;
    if (base < 70) markup = 10;
    else if (base < 100) markup = 15;

    const finalAmount = (base + markup).toFixed(2);

    res.json({
      data: {
        offer_id: offerId,
        total_amount: finalAmount,
        base_amount_original: base.toFixed(2),
        margin_applied: markup,
        total_currency,
        conditions_readable: parsedConditions,
        formatted_slices: formattedSlices,
        passengers: offer.data.passengers,
        available_services: offer.data.available_services || [],
        available_airline_credit_ids: offer.data.available_airline_credit_ids || [],
        intended_payment_methods: offer.data.intended_payment_methods || [],
        full_offer: offer.data
      }
    });
  } catch (error) {
    console.error('Duffel Offer Error:', error.message);
    if (error.errors?.some(e => e.code === 'expired' || e.type === 'not_found'))
      return res.status(400).json({ message: 'Offer expired. Restart search.', expired: true });
    res.status(500).json({ message: 'Failed to retrieve offer', details: error.errors || error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// 4. CREATE BOOKING — 3DS payment + services + airline credits + metadata
// ─────────────────────────────────────────────────────────────────────────
const createBooking = async (req, res) => {
  try {
    const {
      offer_id, passengers, payment_type, payment_id, total_amount,
      services,   // [{ id, quantity }] — seats / bags from ancillaries
      credit_id,  // optional airline credit ID
      metadata    // optional from client, but we mix with Zamgo tracking
    } = req.body;

    if (!offer_id || !passengers || !Array.isArray(passengers))
      return res.status(400).json({ message: 'Missing offer_id or passengers' });

    const orderData = {
      type: req.body.order_type || 'instant',
      selected_offers: [offer_id],
      passengers: passengers.map(p => {
        const passObj = {
          id: p.id,
          given_name: p.given_name,
          family_name: p.family_name,
          born_on: p.born_on,
          gender: p.gender,
          title: p.title,
          email: p.email,
          phone_number: p.phone_number
        };
        // Option 2: Append passport via identity_documents
        if (p.passport_number && p.passport_country && p.passport_expiry) {
           passObj.identity_documents = [{
             type: 'passport',
             unique_identifier: p.passport_number,
             issuing_country_code: p.passport_country,
             expires_on: p.passport_expiry
           }];
        }
        return passObj;
      }),
      metadata: {
         ...metadata,
         agency: "Zamgo Travel Ltd",
         payment_source: payment_type || "card",
         profit_margin: "Fixed Tier logic applied upstream"
      }
    };

    // We must fetch the bare Duffel offer to know exactly what Duffel expects us to pay (excluding our Markup)
    const offer = await duffel.offers.get(offer_id, { return_available_services: true });
    let duffelTotalToPay = parseFloat(offer.data.total_amount);
    
    // Ancillary services (seats, bags) - Add their raw costs
    if (services && Array.isArray(services) && services.length > 0) {
      orderData.services = services;
      services.forEach(selSvc => {
          const foundOfferSvc = offer.data.available_services.find(as => as.id === selSvc.id);
          if (foundOfferSvc) {
              duffelTotalToPay += (parseFloat(foundOfferSvc.total_amount) * selSvc.quantity);
          }
      });
    }

    // SELECT PAYMENT METHOD
    // payment_type comes from frontend ('balance', 'cash', 'card', 'arc_bsp_cash')
    let paymentPayload = [];
    if (payment_type === 'balance') {
      paymentPayload.push({
          type: 'balance',
          amount: duffelTotalToPay.toFixed(2).toString(),
          currency: offer.data.total_currency
      });
    } else if (payment_type === 'cash' || payment_type === 'arc_bsp_cash') {
      // ARC/BSP Cash means the agency settles via IATA/ARC outside of Duffel balance
      paymentPayload.push({
          type: 'arc_bsp_cash',
          amount: duffelTotalToPay.toFixed(2).toString(),
          currency: offer.data.total_currency
      });
    } else if (payment_type === 'card' && payment_id) {
       // Using Duffel Card Component internally
       paymentPayload.push({
          type: 'card',
          amount: duffelTotalToPay.toFixed(2).toString(),
          currency: offer.data.total_currency,
          id: payment_id
       });
    }

    // Add airline credit as a payment method if provided
    if (credit_id) {
      paymentPayload.push({ type: 'airline_credits', id: credit_id });
    }

    if (req.body.order_type !== 'hold') {
        if (paymentPayload.length === 0) {
          return res.status(400).json({ message: 'Valid payment_type (card, balance, cash) required for instant order' });
        }
        orderData.payments = paymentPayload;
    }

    const order = await duffel.orders.create(orderData);
    res.status(201).json({
      success: true,
      message: 'Booked successfully via Duffel',
      data: {
        booking_reference: order.data.booking_reference,
        order_id: order.data.id,
        payment_status: "Paid via " + (payment_type || "card"),
        order: order.data
      }
    });
  } catch (error) {
    console.error('Duffel Booking Error:', error.message);
    const isBadPassenger = error.errors?.some(e => e.code === 'invalid_passenger');
    res.status(500).json({
      message: isBadPassenger ? 'Invalid passenger configuration.' : 'Booking failed',
      details: error.errors || error.message,
      debug: 'Check offer_id, passenger IDs matching the offer request, payment amount, and services list.'
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// 5. GET ORDER
// ─────────────────────────────────────────────────────────────────────────
const getOrder = async (req, res) => {
  try {
    const order = await duffel.orders.get(req.params.order_id);
    res.json({ data: order.data });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', details: error.errors || error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// 6. POST-BOOKING SERVICES — add bags after booking
// ─────────────────────────────────────────────────────────────────────────
const getOrderServices = async (req, res) => {
  try {
    const response = await duffel.orders.getAvailableServices(req.params.order_id);
    res.json({ data: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order services', details: error.errors || error.message });
  }
};

const addOrderServices = async (req, res) => {
  try {
    const { services, payment } = req.body;
    if (!services || !payment)
      return res.status(400).json({ message: 'services and payment are required' });
    const response = await duffel.orders.addServices({
      order_id: req.params.order_id,
      add_services: services,
      payment
    });
    res.json({ data: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add services', details: error.errors || error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// 7. ORDER CHANGE — modify slices (remove old + add new)
// ─────────────────────────────────────────────────────────────────────────
const createOrderChangeRequest = async (req, res) => {
  try {
    const { order_id, slices } = req.body;
    // slices: { remove: [slice_id], add: [{ ...slice_data }] }
    if (!order_id) return res.status(400).json({ message: 'order_id required' });

    const changeRequest = await duffel.orderChangeRequests.create({ 
       order_id, 
       slices: slices || { remove: [], add: [] } 
    });
    res.status(201).json({ success: true, data: changeRequest.data });
  } catch (error) {
    console.error('Order Change Request Error:', error.message);
    res.status(500).json({ 
       success: false, 
       message: 'Failed to create order change request', 
       details: error.errors || error.message 
    });
  }
};

const confirmOrderChange = async (req, res) => {
  try {
    const { change_id } = req.params;
    const { payment } = req.body;
    
    // 1. Confirm the change in Duffel
    const changeResponse = await duffel.orderChanges.confirm(change_id, { payment });
    
    // 2. Fetch the updated full order to sync with database
    const updatedOrder = await duffel.orders.get(changeResponse.data.order_id);

    // 3. Update local database
    try {
      await Booking.findOneAndUpdate(
        { duffelOrderId: updatedOrder.data.id },
        { 
          slices: updatedOrder.data.slices,
          total_amount: updatedOrder.data.total_amount,
          status: updatedOrder.data.status // e.g. 'confirmed'
        }
      );
      console.log(`Local booking ${updatedOrder.data.id} updated after change.`);
    } catch (dbErr) {
      console.error('Failed to sync booking update to DB:', dbErr.message);
    }

    res.json({ 
       success: true, 
       message: 'Order changed successfully', 
       data: updatedOrder.data 
    });
  } catch (error) {
    res.status(500).json({ 
       success: false, 
       message: 'Failed to confirm order change', 
       details: error.errors || error.message 
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// 8. CANCELLATION — quote first, then confirm
// ─────────────────────────────────────────────────────────────────────────
const createCancellationQuote = async (req, res) => {
  try {
    const { order_id } = req.body;
    if (!order_id) return res.status(400).json({ message: 'order_id required' });
    
    const quote = await duffel.orderCancellations.create({ order_id });
    
    res.status(201).json({
      success: true,
      data: {
        cancellation_id: quote.data.id,
        refund_amount: quote.data.refund_amount,
        refund_currency: quote.data.refund_currency,
        refund_to: quote.data.refund_to,
        expires_at: quote.data.expires_at,
        airline_credits: quote.data.airline_credits || []
      }
    });
  } catch (error) {
    console.error('Cancellation Quote Error:', JSON.stringify(error.errors || error.message, null, 2));
    
    let userMessage = 'Cillad ayaa dhacday soo saarista lacagta kuu soo laabanaysa.';
    if (error.errors && error.errors.some(e => e.title === 'order_not_cancellable')) {
      userMessage = 'Duulimaadkan lama joojin karo (Non-refundable). Fadlan la xiriir kooxda caawinta.';
    } else if (error.errors && error.errors.some(e => e.title === 'order_already_cancelled')) {
      userMessage = 'Dalabkan horay ayaa loo joojiyay.';
    }

    res.status(500).json({ 
      success: false, 
      message: userMessage, 
      details: error.errors || error.message 
    });
  }
};

const confirmCancellation = async (req, res) => {
  try {
    const { cancellation_id } = req.params;
    const result = await duffel.orderCancellations.confirm(cancellation_id);
    
    // Update local database if booking exists
    try {
      const orderId = result.data.order_id;
      await Booking.findOneAndUpdate(
        { duffelOrderId: orderId },
        { status: 'cancelled' }
      );
      console.log(`Local booking ${orderId} marked as cancelled.`);
    } catch (dbErr) {
      console.error('Failed to update local booking status:', dbErr.message);
    }

    res.json({ success: true, message: 'Order cancelled successfully', data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to confirm cancellation', details: error.errors || error.message });
  }
};

const requestInvoice = async (req, res) => {
  try {
    const { order_id } = req.body;
    if (!order_id) return res.status(400).json({ message: 'Order ID is required' });

    const order = await duffel.orders.get(order_id);
    const email = order.data.passengers[0]?.email;

    if (!email) {
       return res.status(400).json({ message: 'No email found for this order. Please contact support.' });
    }

    // Logic to send invoice (reusing confirmation email service for now as it contains order details)
    const { sendConfirmationEmail } = require('../services/emailService');
    const { formatOrderForEmail } = require('../utils/emailFormatter');

    const emailData = formatOrderForEmail(order.data, order.data.total_amount);
    await sendConfirmationEmail(email, { ...emailData, subject: `Invoice for ${order.data.booking_reference} - ZamGo Travel` });

    res.json({ success: true, message: `Invoice has been sent to ${email}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send invoice', details: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// 9. WEBHOOKS — handle Duffel events (order.confirmed, order.cancelled, etc.)
// ─────────────────────────────────────────────────────────────────────────
const handleWebhook = (req, res) => {
  try {
    const event = req.body;
    console.log(`[Webhook] Received Duffel event: ${event.type}`);

    switch (event.type) {
      case 'order.confirmed':
        console.log(`✅ Order confirmed: ${event.data?.booking_reference}`);
        // TODO: Send booking confirmation email to customer
        break;
      case 'order.cancelled':
        console.log(`❌ Order cancelled: ${event.data?.id}`);
        // TODO: Notify customer of cancellation + refund status
        break;
      case 'order.airline_initiated_change_updated':
        console.log(`✈️ Airline change detected for order: ${event.data?.order_id}`);
        // TODO: Notify customer of schedule/route change
        break;
      case 'payment.succeeded':
        console.log(`💳 Payment success: ${event.data?.id}`);
        break;
      case 'payment.failed':
        console.error(`⚠️ Payment FAILED: ${event.data?.id} — ${event.data?.failure_reason}`);
        // TODO: Alert customer, offer retry
        break;
      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Webhook] Processing error:', err.message);
    res.status(500).json({ received: false });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// 10. AIRLINE CREDITS
// ─────────────────────────────────────────────────────────────────────────
const getAirlineCredits = async (req, res) => {
  try {
    const { user_id } = req.query;
    let path = '/air/airline_credits';
    if (user_id) path += `?user_id=${user_id}`;
    const response = await duffel.client.request({ method: 'GET', path });
    res.json({ data: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve airline credits', details: error.errors || error.message });
  }
};

const getAirlineCredit = async (req, res) => {
  try {
    const response = await duffel.client.request({ method: 'GET', path: `/air/airline_credits/${req.params.id}` });
    res.json({ data: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve airline credit', details: error.errors || error.message });
  }
};

const createAirlineCredit = async (req, res) => {
  try {
    const response = await duffel.client.request({
      method: 'POST',
      path: '/air/airline_credits',
      data: { data: req.body }
    });
    res.status(201).json({ data: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create airline credit', details: error.errors || error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// 11. COMPONENT CLIENT KEY — for DuffelCardForm & 3DS
// ─────────────────────────────────────────────────────────────────────────
const generateClientKey = async (req, res) => {
  try {
    const response = await duffel.identity.componentClientKeys.create({});
    res.json({ data: { client_key: response.data.component_client_key } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate Client Key', details: error.errors || error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// 12. STRIPE PAYMENT INTENT (ZAMGO CUSTOM GATEWAY)
// ─────────────────────────────────────────────────────────────────────────
const createPaymentIntent = async (req, res) => {
  try {
    const { offer_id, services } = req.body;
    if (!offer_id) return res.status(400).json({ message: 'Missing offer_id' });

    // 1. Fetch exact Duffel Offer Price
    const offer = await duffel.offers.get(offer_id, { return_available_services: true });
    let base = parseFloat(offer.data.total_amount);

    // 2. Add raw cost of ancillary services
    let servicesTotal = 0;
    if (services && Array.isArray(services)) {
        services.forEach(selSvc => {
            const foundOfferSvc = offer.data.available_services.find(as => as.id === selSvc.id);
            if (foundOfferSvc) {
                servicesTotal += (parseFloat(foundOfferSvc.total_amount) * selSvc.quantity);
            }
        });
    }

    // 3. Compute ZamGo Tiered Markup Logic
    let markup = 30;
    if (base < 70) markup = 10;
    else if (base < 100) markup = 15;

    // Wadarta guud: Taxes + Fare + Markup + Services
    const totalAmount = base + markup + servicesTotal;
    
    // 4. Create Stripe Payment Intent using Duffel Offer Currency
    const offerCurrency = (offer.data.total_currency || 'GBP').toLowerCase();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // convert to cents
      currency: offerCurrency,
      payment_method_types: ['card'],
      metadata: {
        offer_id: offer_id,
        markup: markup.toString(),
        base_fare: base.toString(),
        services_total: servicesTotal.toString(),
        currency: offerCurrency.toUpperCase()
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      totalAmount: totalAmount.toFixed(2),
      currency: offerCurrency.toUpperCase()
    });
  } catch (error) {
    console.error("Stripe Error Details:", error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Stripe Gateway Error', 
      error: error.message || 'Payment engine failed to start' 
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// 13. STRIPE CONFIRM BOOKING
// ─────────────────────────────────────────────────────────────────────────
const { sendConfirmationEmail } = require('../services/emailService');

// Helper to format Duffel order for the email template
const formatOrderForEmail = (order, duffelTotalWithMarkup) => {
  const slice = order.slices[0];
  const segment = slice.segments[0];
  
  return {
    pnr: order.booking_reference,
    orderId: order.id,
    airline: segment.operating_carrier.name,
    flightNumber: segment.operating_carrier_flight_number,
    airportFrom: segment.origin.iata_code,
    airportTo: segment.destination.iata_code,
    departureDate: new Date(segment.departing_at).toLocaleString(),
    arrivalDate: new Date(segment.arriving_at).toLocaleString(),
    passengers: order.passengers,
    totalPrice: duffelTotalWithMarkup.toFixed(2),
    currency: order.total_currency
  };
};

const confirmBooking = async (req, res) => {
  try {
    const { paymentIntentId, offer_id, passengers, services, metadata, totalPriceWithMarkup } = req.body;
    
    // 1. Verify Payment Intent is successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
       return res.status(400).json({ message: 'Payment not successful yet' });
    }

    // 2. Fetch raw Duffel Offer Price
    const offer = await duffel.offers.get(offer_id, { return_available_services: true });
    let duffelTotalToPay = parseFloat(offer.data.total_amount);
    
    // Add raw cost of ancillary services
    if (services && Array.isArray(services) && services.length > 0) {
        services.forEach(selSvc => {
            const foundOfferSvc = offer.data.available_services.find(as => as.id === selSvc.id);
            if (foundOfferSvc) {
                duffelTotalToPay += (parseFloat(foundOfferSvc.total_amount) * selSvc.quantity);
            }
        });
    }

    const orderData = {
      type: 'instant',
      selected_offers: [offer_id],
      passengers: passengers.map(p => {
        const passObj = {
          id: p.id,
          given_name: p.given_name,
          family_name: p.family_name,
          born_on: p.born_on,
          gender: p.gender,
          title: p.title,
          email: p.email,
          phone_number: p.phone_number
        };
        if (p.passport_number && p.passport_country && p.passport_expiry) {
           const country = (p.passport_country || '').trim().toUpperCase();
           if (country.length === 2) {
             passObj.identity_documents = [{
               type: 'passport',
               unique_identifier: p.passport_number,
               issuing_country_code: country,
               expires_on: p.passport_expiry
             }];
           }
         }
         return passObj;
      }),
      metadata: {
         ...metadata,
         stripe_payment_intent: paymentIntentId,
         agency: "ZamGo Travel Ltd",
         payment_source: "stripe_card",
         profit_margin: "Stripe Payment Captured"
      }
    };

    if (services && Array.isArray(services) && services.length > 0) {
      orderData.services = services;
    }

    // 3. Issue ticket via Duffel Payments
    const isTestMode = (process.env.DUFFEL_API_KEY || '').startsWith('duffel_test_');
    orderData.payments = [{
        type: isTestMode ? 'balance' : 'arc_bsp_cash',
        amount: duffelTotalToPay.toFixed(2).toString(),
        currency: offer.data.total_currency
    }];

    console.log('Sending Order Data to Duffel:', JSON.stringify(orderData, null, 2));

    const order = await duffel.orders.create(orderData);

    // 4. Save to MongoDB (Enable local 'Manage Booking')
    try {
      if (order.data && order.data.slices && order.data.slices.length > 0) {
        const slice = order.data.slices[0];
        const segment = slice.segments[0];
        
        await Booking.create({
          userId: req.user?._id || metadata?.customer_id, 
          pnr: order.data.booking_reference,
          paymentIntentId: paymentIntentId,
          status: 'paid',
          airline: segment.operating_carrier.name,
          flightNumber: segment.operating_carrier_flight_number,
          airportFrom: segment.origin.iata_code,
          airportTo: segment.destination.iata_code,
          departureDate: segment.departing_at,
          arrivalDate: segment.arriving_at,
          finalPrice: totalPriceWithMarkup || duffelTotalToPay,
          passengers: passengers.map(p => ({
              firstName: p.given_name,
              lastName: p.family_name,
              gender: p.gender,
              born_on: p.born_on,
              type: p.type || 'adult'
          })),
          flightData: order.data 
        });
        console.log(`Booking ${order.data.booking_reference} saved to MongoDB`);
      }
    } catch (saveErr) {
      console.error('Failed to save booking to MongoDB:', saveErr);
    }

    // 5. Send Confirmation Email (Treated carefully before response)
    try {
      const emailData = formatOrderForEmail(order.data, totalPriceWithMarkup || duffelTotalToPay);
      const primaryEmail = passengers[0]?.email || paymentIntent.receipt_email;
      if (primaryEmail) {
        await sendConfirmationEmail(primaryEmail, emailData);
        console.log(`Confirmation email sent to ${primaryEmail}`);
      }
    } catch (emailErr) {
      console.error('Email Service Error (Booking was successful):', emailErr.message);
    }
    
    // 6. Return success to Frontend
    return res.status(201).json({
      success: true,
      data: order.data,
      order: order.data,
      message: 'Booking confirmed and ticket issued'
    });
  } catch (error) {
    console.error('Duffel Order Creation Error:', JSON.stringify(error.errors || error.message, null, 2));
    
    // Extract specific Duffel errors if available
    let errorDetails = error.message;
    if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
       errorDetails = error.errors.map(e => {
         if (e.title === 'insufficient_balance') {
           return "Duffel Test Balance-kaaga ayaa ebar ah. Fadlan ku shubo 'Test Credits' adoo tagaya Duffel Dashboard -> Payments.";
         }
         return `${e.title}: ${e.message}`;
       }).join(' | ');
    }

    return res.status(500).json({ 
      success: false,
      message: 'Booking Failed', 
      details: errorDetails,
      debug: error.errors 
    });
  }
};

const retrieveOrderDetail = async (req, res) => {
  try {
    const { pnr, lastName } = req.query; // Expecting ?pnr=ABC&lastName=Doe
    
    if (!pnr || !lastName) {
      return res.status(400).json({ message: 'PNR and Last Name are required.' });
    }

    console.log(`Searching Duffel Order by PNR: ${pnr}`);
    
    // 1. List orders filtered by booking reference
    const ordersList = await duffel.orders.list({ booking_reference: pnr });
    
    if (!ordersList.data || ordersList.data.length === 0) {
      return res.status(404).json({ message: 'No booking found with this PNR in Duffel.' });
    }

    // Get the full order details (list might be summary)
    const order = await duffel.orders.get(ordersList.data[0].id);

    // 1b. Check if order is already cancelled
    if (order.data.status === 'cancelled') {
      return res.status(404).json({ 
        message: 'This booking has been cancelled and is no longer accessible.' 
      });
    }

    // 2. Validate Last Name against passengers
    const nameMatches = order.data.passengers.some(p => 
      p.family_name.toLowerCase() === lastName.toLowerCase()
    );

    if (!nameMatches) {
      return res.status(403).json({ message: 'Last Name does not match any passenger on this booking.' });
    }

    // 3. Enrich with Transit/Layover Calculations
    const slices = order.data.slices.map(slice => {
        const segments = slice.segments.map((segment, idx) => {
            const enriched = { ...segment };
            
            // Calculate Layover if not the last segment
            if (idx < slice.segments.length - 1) {
                const arrival = new Date(segment.arriving_at);
                const nextDeparture = new Date(slice.segments[idx + 1].departing_at);
                const diffMs = nextDeparture - arrival;
                const hours = Math.floor(diffMs / 3600000);
                const minutes = Math.round((diffMs % 3600000) / 60000);
                enriched.layover = `${hours}h ${minutes}m`;
                enriched.layover_airport = slice.segments[idx + 1].origin;
            }
            return enriched;
        });
        return { ...slice, segments };
    });

    res.json({
      success: true,
      data: {
         ...order.data,
         slices // Overwrite with enriched slices
      }
    });
  } catch (error) {
    console.error('Duffel Order Retrieval Error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve order from Duffel', 
      details: error.errors || error.message 
    });
  }
};

module.exports = {
  getAirports,
  searchFlights,
  priceCheck,
  getOffer,
  createBooking,
  getOrder,
  getOrderServices,
  addOrderServices,
  createOrderChangeRequest,
  confirmOrderChange,
  createCancellationQuote,
  confirmCancellation,
  handleWebhook,
  getAirlineCredits,
  getAirlineCredit,
  createAirlineCredit,
  generateClientKey,
  createPaymentIntent,
  confirmBooking,
  retrieveOrderDetail,
  requestInvoice
};
