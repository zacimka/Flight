const express = require('express');
const { protect, authorizeAdmin, authorizeAgentOrAdmin } = require('../middlewares/auth');
const { setMarkup, getBookings, getRevenue, refundBooking, updateBookingStatus, createManualBooking, getAdminStats } = require('../controllers/adminController');

const router = express.Router();
router.use(protect);

router.post('/markup', authorizeAdmin, setMarkup);
router.get('/bookings', authorizeAgentOrAdmin, getBookings);
router.post('/bookings', authorizeAgentOrAdmin, createManualBooking);
router.patch('/bookings/:id', authorizeAgentOrAdmin, updateBookingStatus);
router.get('/revenue', authorizeAdmin, getRevenue);
router.get('/stats', authorizeAdmin, getAdminStats);
router.post('/bookings/:id/refund', authorizeAdmin, refundBooking);

module.exports = router;
