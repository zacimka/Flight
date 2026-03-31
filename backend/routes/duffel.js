const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getAirports,
  searchFlights,
  getOffer,
  createBooking,
  getAirlineCredits,
  getAirlineCredit,
  createAirlineCredit,
  generateClientKey
} = require('../controllers/duffelController');

const router = express.Router();

router.get('/client-key', generateClientKey);
router.get('/airports', getAirports);
router.post('/search-flights', searchFlights);
router.get('/offer/:id', getOffer);
router.post('/create-booking', protect, createBooking);

router.get('/airline-credits', protect, getAirlineCredits);
router.get('/airline-credits/:id', protect, getAirlineCredit);
router.post('/airline-credits', protect, createAirlineCredit);

module.exports = router;
