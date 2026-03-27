const Booking = require('../models/Booking');
const Markup = require('../models/Markup');
const { createPaymentIntent } = require('../services/stripeService');
const { sendTicketEmail, generateTicketPDF } = require('../services/emailService');

const createBookingIntent = async (req, res, next) => {
  try {
    console.log('--- BOOKING ATTEMPT ---');
    const { flightData, basePrice, passengers, extras, adults, children, infants } = req.body;
    
    const numericBasePrice = Number(basePrice) || 0;
    
    // Always fetch latest markup
    const markupSetting = await Markup.findOne().sort('-createdAt') || { type: 'fixed', value: 20 };
    let markupValue = markupSetting.value;
    if (markupSetting.type === 'percentage') {
      markupValue = (numericBasePrice * markupSetting.value) / 100;
    }
    
    const finalPrice = Number((numericBasePrice + markupValue).toFixed(2));
    
    // Create Payment Intent
    let paymentIntent;
    try {
        paymentIntent = await createPaymentIntent(finalPrice);
    } catch (paymentErr) {
        console.error('Stripe Error:', paymentErr);
        return res.status(500).json({ message: 'Payment gateway initialization failed' });
    }

    // Generate identifiers
    const pnr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ticketNumbers = (passengers || []).map(() => 
        `TK-${Math.floor(100000000 + Math.random() * 900000000)}`
    );

    // Date Fallbacks
    const departureDate = flightData?.departure?.time || flightData?.departureDate || Date.now();
    const arrivalDate = flightData?.arrival?.time || flightData?.arrivalDate || Date.now();

    const bookingPayload = {
      userId: req.user._id,
      flightData: flightData || {},
      airportFrom: flightData?.origin || flightData?.departure?.airport || 'N/A',
      airportTo: flightData?.destination || flightData?.arrival?.airport || 'N/A',
      airline: flightData?.airline || 'N/A',
      flightNumber: flightData?.flightNumber || 'N/A',
      departureDate: new Date(departureDate),
      arrivalDate: new Date(arrivalDate),
      basePrice: numericBasePrice,
      markup: markupValue,
      finalPrice,
      status: 'pending',
      paymentIntentId: paymentIntent.id,
      adults: Number(adults) || 1,
      children: Number(children) || 0,
      infants: Number(infants) || 0,
      passengers: (passengers || []).map(p => ({
          ...p,
          gender: p.gender || 'male',
          birthDate: p.birthDate ? new Date(p.birthDate) : undefined
      })),
      extras: extras || { baggage: "standard", seatPreference: "any", meal: "standard" },
      pnr,
      ticketNumbers
    };

    try {
      const booking = await Booking.create(bookingPayload);
      res.status(201).json({ 
        bookingId: booking._id,
        finalPrice: booking.finalPrice,
        status: booking.status,
        clientSecret: paymentIntent.client_secret,
        booking
      });
    } catch (createErr) {
      console.error('MONGOOSE ERROR:', createErr);
      
      // If validation fails, return the error keys to the user
      const errDetail = createErr.errors 
        ? Object.keys(createErr.errors).map(key => `${key}: ${createErr.errors[key].message}`).join(', ')
        : createErr.message;
        
      res.status(400).json({ 
        message: 'Database validation failed', 
        details: errDetail,
        debug_info: bookingPayload 
      });
    }
  } catch (err) {
    console.error('TOP LEVEL BOOKING ERROR:', err);
    next(err);
  }
};

const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort('-createdAt');
    res.json({ data: bookings });
  } catch (err) {
    next(err);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json({ data: booking });
  } catch (err) {
    next(err);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    const booking = await Booking.findOne({ paymentIntentId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'paid';
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

const getBookingPDF = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const pdfBuffer = await generateTicketPDF({ ...booking.toObject(), userId: { name: req.user.name, email: req.user.email } });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=ticket-${booking._id}.pdf`, 'Content-Length': pdfBuffer.length });
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

module.exports = { createBookingIntent, confirmPayment, getUserBookings, getBookingById, getBookingPDF };
