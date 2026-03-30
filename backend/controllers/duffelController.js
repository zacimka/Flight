const duffel = require('../services/duffelService');

// 1. AIRPORT SEARCH (PLACES API)
const getAirports = async (req, res, next) => {
  try {
    const { lat, lng, rad, q } = req.query;
    
    // Duffel accepts query strings or latitude/longitude for suggestion lookups
    let params = {};
    if (lat && lng) {
       params.lat = parseFloat(lat);
       params.lng = parseFloat(lng);
       if (rad) params.rad = parseInt(rad);
    } else if (q) {
       params.query = q;
    } else {
       return res.status(400).json({ message: 'Must provide either ?q=SearchTerm or ?lat=..&lng=..' });
    }

    const suggestions = await duffel.suggestions.list(params);
    
    const mappedAirports = suggestions.data.map(place => ({
      airport_name: place.name,
      iata_code: place.iata_code,
      city_name: place.city_name,
      coordinates: {
        latitude: place.latitude,
        longitude: place.longitude
      }
    }));

    res.json({ data: mappedAirports });
  } catch (error) {
    console.error('Duffel Places Error:', error.message);
    res.status(500).json({ message: 'Flight suggestions failed', details: error.errors || error.message });
  }
};

// 2. SEARCH FLIGHTS (WITH PRIVATE FARES)
const searchFlights = async (req, res, next) => {
  try {
    const { origin, destination, departure_date, return_date, adults, children, cabin_class, max_connections, private_fares } = req.body;

    if (!origin || !destination || !departure_date || !adults) {
      return res.status(400).json({ message: 'Missing required fields for flight search' });
    }

    const passengers = [];
    for (let i = 0; i < parseInt(adults); i++) passengers.push({ type: 'adult' });
    for (let i = 0; i < parseInt(children || 0); i++) passengers.push({ type: 'child' });

    const slices = [{ origin, destination, departure_date }];
    if (return_date) {
      slices.push({ origin: destination, destination: origin, departure_date: return_date });
    }

    // Performance Optimization: limit offers to 50, use max connections
    const requestPayload = {
      return_offers: true,
      slices,
      passengers,
      cabin_class: cabin_class || 'economy',
      supplier_timeout: 10000,
      max_connections: max_connections !== undefined ? parseInt(max_connections) : undefined,
    };

    // Private Fares integration (Corporate/Negotiated)
    if (private_fares && typeof private_fares === 'object') {
       requestPayload.private_fares = private_fares;
    }

    const offerRequest = await duffel.offerRequests.create(requestPayload);

    // Limit offers to 50 mapping requirement
    const limitedOffers = (offerRequest.data.offers || []).slice(0, 50);

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

// 3. & 4. OFFER DETAILS (CONDITIONS HANDLING + STOPS/SEGMENTS)
const getOffer = async (req, res, next) => {
  try {
    const offerId = req.params.id;
    if (!offerId) return res.status(400).json({ message: 'Offer ID required' });

    // Ensure latest pricing via retrieval
    const offer = await duffel.offers.get(offerId);

    const { total_amount, total_currency, slices, conditions } = offer.data;

    // Conditions Business Logic Interpretation
    const parseCondition = (cond) => {
      if (!cond || cond.allowed === undefined) return "Rules unavailable";
      if (!cond.allowed) return "Not allowed";
      if (cond.allowed && !cond.penalty_amount) return "Free explicitly";
      if (cond.allowed && cond.penalty_amount > 0) return `Allowed with penalty (${cond.penalty_currency} ${cond.penalty_amount})`;
      return "Unknown mapping";
    };

    const parsedConditions = {
       change: conditions?.change_before_departure ? parseCondition(conditions.change_before_departure) : "Not changeable",
       refund: conditions?.refund_before_departure ? parseCondition(conditions.refund_before_departure) : "Not refundable",
    };

    // Segment & Stop Formatting
    const formattedSlices = slices.map(slice => {
        return {
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
        };
    });

    res.json({
      data: {
        offer_id: offerId,
        total_amount,
        total_currency,
        conditions_readable: parsedConditions,
        formatted_slices: formattedSlices,
        passengers: offer.data.passengers,
        full_offer: offer.data
      }
    });
  } catch (error) {
    console.error('Duffel Offer Error:', error.message);
    
    // Explicit Expired Offer trapping
    if (error.errors && error.errors.some(e => e.code === 'expired' || e.type === 'not_found')) {
       return res.status(400).json({ message: 'Offer has expired. Please restart search.', expired: true });
    }
    res.status(500).json({ message: 'Failed to retrieve offer details', details: error.errors || error.message });
  }
};

// 5. CREATE BOOKING
const createBooking = async (req, res, next) => {
  try {
    const { offer_id, passengers, payments, total_amount, total_currency } = req.body;

    if (!offer_id || !passengers || !Array.isArray(passengers)) {
      return res.status(400).json({ message: 'Missing offer_id or properly formatted passengers array' });
    }

    const orderData = {
      type: 'hold', 
      selected_offers: [offer_id],
      passengers: passengers.map(p => ({
        id: p.id, // Mandatory from offer request
        given_name: p.given_name,
        family_name: p.family_name,
        born_on: p.born_on,
        gender: p.gender,
        title: p.title,
        email: p.email,
        phone_number: p.phone_number
      }))
    };

    // Payment mapping explicitly
    if (payments && Array.isArray(payments) && payments.length > 0) {
        orderData.type = 'instant';
        orderData.payments = payments; // E.g., type: "balance", exact amnt provided.
    } else if (total_amount && total_currency) {
        orderData.type = 'instant';
        orderData.payments = [{
            type: 'balance',
            amount: total_amount.toString(),
            currency: total_currency
        }];
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
    
    // Check missing passenger ID invalidity or mismatch
    const isBadPassengerId = error.errors?.some(e => e.code === 'invalid_passenger' || e.message.includes('passenger'));
    
    res.status(500).json({ 
       message: isBadPassengerId ? 'Invalid passenger configuration.' : 'Booking failed with vendor', 
       details: error.errors || error.message,
       debug: 'Check offer_id validity, passenger IDs mapping exactly to offer request, and payment amount match.'
    });
  }
};

module.exports = { getAirports, searchFlights, getOffer, createBooking };
