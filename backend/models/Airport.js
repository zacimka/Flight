const mongoose = require("mongoose");

const airportSchema = new mongoose.Schema({
  name: String,
  city: String,
  country: String,
  IATA: String,
  ICAO: String,
  latitude: Number,
  longitude: Number,
});

// Adding index on name, city, and IATA to make queries significantly faster
airportSchema.index({ name: 1 });
airportSchema.index({ city: 1 });
airportSchema.index({ IATA: 1 });

module.exports = mongoose.model("Airport", airportSchema);
