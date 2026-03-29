const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Ensure dotenv loads the backend .env if we run this from root or backend
dotenv.config({ path: path.join(__dirname, ".env") });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Define Airport Schema (or import it if you already have it in models/Airport.js)
const airportSchema = new mongoose.Schema({
  name: String,
  city: String,
  country: String,
  IATA: String,
  ICAO: String,
  latitude: Number,
  longitude: Number,
});

const Airport = mongoose.model("Airport", airportSchema);

async function seed() {
  try {
    console.log("Loading airports.json from disk...");
    // Read the airports.json file we generated earlier in the root directory
    const airportsRaw = fs.readFileSync(path.join(__dirname, "airports.json"), "utf-8");
    const airports = JSON.parse(airportsRaw);

    console.log("Formatting data to match your schema...");
    const formattedAirports = airports.map(a => ({
      name: a.name,
      city: a.city,
      country: a.country,
      IATA: a.iata_code,
      ICAO: a.icao_code,
      latitude: a.coordinates ? a.coordinates.latitude : null,
      longitude: a.coordinates ? a.coordinates.longitude : null,
    }));

    // Optional: Clear existing airports to prevent duplicates if you run this multiple times
    console.log("Removing existing Airport documents...");
    await Airport.deleteMany({});

    console.log(`Inserting ${formattedAirports.length} airports in batches...`);
    const BATCH_SIZE = 5000;
    for (let i = 0; i < formattedAirports.length; i += BATCH_SIZE) {
      const batch = formattedAirports.slice(i, i + BATCH_SIZE);
      await Airport.insertMany(batch);
      console.log(`Successfully inserted ${Math.min(i + BATCH_SIZE, formattedAirports.length)} / ${formattedAirports.length}`);
    }

    console.log("All airports imported successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error importing airports:", err);
    process.exit(1);
  }
}

seed();
