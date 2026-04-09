const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getAirports,
  searchFlights,
  priceCheck,
  getOffer,
  createBooking,
  getOrder,
  getOrderServices,
  addOrderServices,
  createOrderChangeRequest,
  createOrderChangePaymentIntent,
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
} = require('../controllers/duffelController');

const router = express.Router();

// ── Public — Order Retrieval & Management ────────────────────────────────
router.get('/client-key', generateClientKey);
router.get('/airports', getAirports);
router.post('/search-flights', searchFlights);
router.post('/price-check', priceCheck);
router.get('/offer/:id', getOffer);
router.get('/orders/retrieve', retrieveOrderDetail);

// Public Order Management (Accessed via PNR/Last Name validation results)
router.post('/cancellation-quote', createCancellationQuote);
router.post('/cancellations/:cancellation_id/confirm', confirmCancellation);
router.post('/request-invoice', requestInvoice);
router.post('/orders/change', createOrderChangeRequest); // Added per user request

// ── Webhooks (no auth — Duffel sends these) ───────────────────────────────
router.post('/webhooks', handleWebhook);

// ── Protected — booking ───────────────────────────────────────────────────
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm-booking', protect, confirmBooking);
router.post('/create-booking', protect, createBooking);
router.get('/orders/:order_id', protect, getOrder);
router.get('/orders/:order_id/services', protect, getOrderServices);
router.post('/orders/:order_id/services', protect, addOrderServices);

// ── Protected — order changes ─────────────────────────────────────────────
router.post('/order-change-request', createOrderChangeRequest);
router.post('/order-change-payment-intent', createOrderChangePaymentIntent);
router.post('/order-changes/:change_id/confirm', confirmOrderChange);

// ── Protected — airline credits ───────────────────────────────────────────
router.get('/airline-credits', protect, getAirlineCredits);
router.get('/airline-credits/:id', protect, getAirlineCredit);
router.post('/airline-credits', protect, createAirlineCredit);

module.exports = router;
