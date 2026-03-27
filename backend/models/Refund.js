const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },
    stripeRefundId: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Refund", refundSchema);
