const express = require('express');
const { protect } = require('../middlewares/auth');
const { searchFlights, getOffer, createBooking } = require('../controllers/duffelController');

const router = express.Router();

router.post('/search-flights', searchFlights);
router.get('/offer/:id', getOffer);
router.post('/create-booking', protect, createBooking);

module.exports = router;
