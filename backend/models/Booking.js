const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    flightData: { type: Object, required: true },
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    infants: { type: Number, default: 0 },
    passengers: [
      {
        firstName: String,
        lastName: String,
        gender: String,
        birthDate: Date,
        passportNumber: String,
        type: { type: String, default: "adult" },
      }
    ],
    extras: {
      baggage: { type: String, default: "standard" },
      seatPreference: { type: String, default: "any" },
      meal: { type: String, default: "standard" },
    },
    contact: {
      email: { type: String, required: false },
      phone: { type: String, required: false },
    },
    pnr: { type: String },
    ticketNumbers: [String],
    airportFrom: { type: String },
    airportTo: { type: String },
    airline: { type: String },
    flightNumber: { type: String },
    departureDate: { type: Date },
    arrivalDate: { type: Date },
    basePrice: { type: Number },
    markup: { type: Number },
    finalPrice: { type: Number },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "refunded"],
      default: "pending",
    },
    paymentId: { type: String, required: false },
    paymentIntentId: { type: String, required: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
