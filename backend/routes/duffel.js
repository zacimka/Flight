const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getAirports,
  searchFlights,
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
  generateClientKey
} = require('../controllers/duffelController');

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────
router.get('/client-key', generateClientKey);
router.get('/airports', getAirports);
router.post('/search-flights', searchFlights);
router.get('/offer/:id', getOffer);

// ── Webhooks (no auth — Duffel sends these) ───────────────────────────────
router.post('/webhooks', handleWebhook);

// ── Protected — booking ───────────────────────────────────────────────────
router.post('/create-booking', protect, createBooking);
router.get('/orders/:order_id', protect, getOrder);
router.get('/orders/:order_id/services', protect, getOrderServices);
router.post('/orders/:order_id/services', protect, addOrderServices);

// ── Protected — order changes ─────────────────────────────────────────────
router.post('/order-change-request', protect, createOrderChangeRequest);
router.post('/order-changes/:change_id/confirm', protect, confirmOrderChange);

// ── Protected — cancellation ──────────────────────────────────────────────
router.post('/cancellation-quote', protect, createCancellationQuote);
router.post('/cancellations/:cancellation_id/confirm', protect, confirmCancellation);

// ── Protected — airline credits ───────────────────────────────────────────
router.get('/airline-credits', protect, getAirlineCredits);
router.get('/airline-credits/:id', protect, getAirlineCredit);
router.post('/airline-credits', protect, createAirlineCredit);

module.exports = router;
