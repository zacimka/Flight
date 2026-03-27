const express = require("express");
const router = express.Router();
const { createPaymentIntent } = require("../controllers/paymentController");
const { protect } = require("../middlewares/auth");

// POST /api/payments/create
// We can explicitly protect this route, or leave it unprotected for mock payment testing
router.post("/create", createPaymentIntent);

module.exports = router;
