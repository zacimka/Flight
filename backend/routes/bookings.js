const express = require("express");
const { protect } = require("../middlewares/auth");
const {
  createBookingIntent,
  confirmPayment,
  getUserBookings,
  getBookingById,
  getBookingPDF,
} = require("../controllers/bookingController");
const router = express.Router();

router.post("/", protect, createBookingIntent);
router.post("/confirm-payment", protect, confirmPayment);
router.get("/", protect, getUserBookings);
router.get("/:id", protect, getBookingById);
router.get("/:id/pdf", protect, getBookingPDF);

module.exports = router;
