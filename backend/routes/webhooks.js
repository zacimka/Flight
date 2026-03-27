const express = require('express');
const { stripeWebhookHandler } = require('../controllers/webhookController');

const router = express.Router();
router.post('/stripe', stripeWebhookHandler);

module.exports = router;
