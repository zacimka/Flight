const duffel = require('../services/duffelService');

const searchFlights = async (req, res, next) => {
  try {
    const { origin, destination, departure_date, return_date, adults, children } = req.body;

    if (!origin || !destination || !departure_date || !adults) {
      return res.status(400).json({ message: 'Missing required fields for flight search' });
    }

    // Convert passengers correctly mapped to Duffel objects
    const passengers = [];
    for (let i = 0; i < parseInt(adults); i++) passengers.push({ type: 'adult' });
    for (let i = 0; i < parseInt(children || 0); i++) passengers.push({ type: 'child' });

    // Convert slices
    const slices = [{ origin, destination, departure_date }];
    if (return_date) {
      slices.push({ origin: destination, destination: origin, departure_date: return_date });
    }

    const offerRequest = await duffel.offerRequests.create({
      return_offers: true,
      slices,
      passengers,
      cabin_class: req.body.cabin_class || 'economy'
    });

    res.json({
      data: {
        offer_request_id: offerRequest.data.id,
        passengers: offerRequest.data.passengers, // contains { id, type } required for booking
        offers: offerRequest.data.offers
      }
    });

  } catch (error) {
    console.error('Duffel Search Error:', error.message);
    res.status(500).json({ message: 'Flight search failed', details: error.errors || error.message });
  }
};

const getOffer = async (req, res, next) => {
  try {
    const offerId = req.params.id;
    if (!offerId) return res.status(400).json({ message: 'Offer ID required' });

    // Retrieve a single refreshed offer to ensure latest pricing
    const offer = await duffel.offers.get(offerId);

    const { total_amount, total_currency, slices } = offer.data;

    res.json({
      data: {
        offer_id: offerId,
        total_amount,
        total_currency,
        slices,
        passengers: offer.data.passengers,
        full_offer: offer.data
      }
    });
  } catch (error) {
    console.error('Duffel Offer Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve offer details', details: error.errors || error.message });
  }
};

const createBooking = async (req, res, next) => {
  try {
    const { offer_id, passengers, total_amount, total_currency } = req.body;

    if (!offer_id || !passengers || !Array.isArray(passengers)) {
      return res.status(400).json({ message: 'Missing offer_id or properly formatted passengers array' });
    }

    // Attempt booking (Orders.create)
    // IMPORTANT: Payment type "balance" deducts from Duffel live/test wallet.
    // The amount must strictly match the latest offer total_amount!
    const orderData = {
      type: 'hold', // Can be 'instant' if paying immediately via balance
      selected_offers: [offer_id],
      passengers: passengers.map(p => ({
        id: p.id, // ID MUST match the ID from offer request passengers
        given_name: p.given_name,
        family_name: p.family_name,
        born_on: p.born_on,
        gender: p.gender,
        title: p.title,
        email: p.email,
        phone_number: p.phone_number
      }))
    };

    // If providing payments array explicitly
    if (total_amount && total_currency) {
        orderData.type = 'instant';
        orderData.payments = [
            {
                type: 'balance',
                amount: total_amount.toString(),
                currency: total_currency
            }
        ];
    }

    const order = await duffel.orders.create(orderData);

    res.status(201).json({
      message: 'Flight booked successfully via Duffel',
      data: {
        booking_reference: order.data.booking_reference,
        order_id: order.data.id,
        order: order.data
      }
    });

  } catch (error) {
    console.error('Duffel Booking Error:', error.message);
    res.status(500).json({ 
       message: 'Booking failed with vendor', 
       details: error.errors || error.message,
       debug: 'Check offer_id validity, passenger IDs mapping exactly to offer request, and payment amount match.'
    });
  }
};

module.exports = { searchFlights, getOffer, createBooking };
