const mongoose = require("mongoose");

const markupSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["fixed", "percentage"], required: true },
    value: { type: Number, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Markup", markupSchema);
