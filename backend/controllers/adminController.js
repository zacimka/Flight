const Markup = require('../models/Markup');
const Booking = require('../models/Booking');
const Refund = require('../models/Refund');
const { createRefund } = require('../services/stripeService');

const setMarkup = async (req, res, next) => {
  try {
    const { type, value } = req.body;
    if (!['fixed', 'percentage'].includes(type) || value == null) {
      return res.status(400).json({ message: 'type must be fixed or percentage, and value required' });
    }
    const markup = await Markup.create({ type, value });
    res.status(201).json({ data: markup });
  } catch (err) {
    next(err);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate('userId', 'name email role').sort('-createdAt');
    res.json({ data: bookings });
  } catch (err) {
    next(err);
  }
};

const getRevenue = async (req, res, next) => {
  try {
    const paidBookings = await Booking.find({ status: 'paid' });
    const revenue = paidBookings.reduce((sum, b) => sum + b.finalPrice, 0);
    res.json({ data: { revenue, totalBookings: paidBookings.length } });
  } catch (err) {
    next(err);
  }
};

const refundBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'paid') return res.status(400).json({ message: 'Only paid bookings can be refunded' });

    const refundResult = await createRefund(booking.paymentIntentId, booking.finalPrice);
    booking.status = 'refunded';
    await booking.save();
    const refundRecord = await Refund.create({ bookingId: booking._id, amount: booking.finalPrice, status: 'succeeded', stripeRefundId: refundResult.id });

    res.json({ data: { booking, refund: refundRecord } });
  } catch (err) {
    next(err);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    await booking.save();
    res.json({ data: booking });
  } catch (err) {
    next(err);
  }
};

const createManualBooking = async (req, res, next) => {
  try {
    const { 
      userId, flightId, basePrice, markup, status,
      airportFrom, airportTo, airline, flightNumber, departureDate, arrivalDate
    } = req.body;
    const finalPrice = basePrice + (markup || 0);

    const booking = await Booking.create({
      userId,
      flightData: {
        basePrice,
        markup,
        finalPrice,
        status: status || 'pending',
        flightId,
        airline,
        flightNumber
      },
      airportFrom: airportFrom || 'TBD',
      airportTo: airportTo || 'TBD',
      airline: airline || 'Manual',
      flightNumber: flightNumber || 'MANUAL-PNR',
      departureDate: departureDate ? new Date(departureDate) : new Date(),
      arrivalDate: arrivalDate ? new Date(arrivalDate) : new Date(),
      basePrice,
      markup: markup || 0,
      finalPrice,
      status: status || 'pending'
    });

    res.status(201).json({
      message: 'Booking created manually successfully',
      booking
    });
  } catch (err) {
    next(err);
  }
};

const getAdminStats = async (req, res, next) => {
  try {
    const allBookings = await Booking.find();
    const paidBookings = allBookings.filter(b => b.status === 'paid');
    
    // Revenue stats
    const totalRevenue = paidBookings.reduce((sum, b) => sum + b.finalPrice, 0);
    const totalMarkups = paidBookings.reduce((sum, b) => sum + b.markup, 0);

    // Activity stats (counts by status)
    const statusCounts = allBookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});

    // Route popularity
    const routeStats = allBookings.reduce((acc, b) => {
      const route = `${b.airportFrom} ➔ ${b.airportTo}`;
      acc[route] = (acc[route] || 0) + 1;
      return acc;
    }, {});
    
    const topRoutes = Object.entries(routeStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([route, count]) => ({ route, count }));

    res.json({
      data: {
        totalRevenue,
        totalMarkups,
        totalBookings: allBookings.length,
        statusCounts,
        topRoutes,
        recentGrowth: 15 // Mock growth percentage
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { setMarkup, getBookings, getRevenue, refundBooking, updateBookingStatus, createManualBooking, getAdminStats };
