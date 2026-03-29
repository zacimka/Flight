const Airport = require("../models/Airport");

// Helper to escape regex characters safely
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Default high-traffic airports to suggest when no match is found
const DEFAULT_SUGGESTIONS = [
  { airport: "John F Kennedy Intl", city: "New York", country: "United States", IATA: "JFK" },
  { airport: "Heathrow", city: "London", country: "United Kingdom", IATA: "LHR" },
  { airport: "Charles de Gaulle", city: "Paris", country: "France", IATA: "CDG" },
  { airport: "Dubai International", city: "Dubai", country: "United Arab Emirates", IATA: "DXB" },
  { airport: "Los Angeles International", city: "Los Angeles", country: "United States", IATA: "LAX" }
];

const searchAirports = async (req, res, next) => {
  try {
    // 1 & 3: Debug logs and input trimming/normalization
    console.log(`[GET /api/airports] Request Query:`, req.query);
    const rawQuery = req.query.q || "";
    const cleanQuery = rawQuery.trim().toLowerCase();
    
    // Return early with suggestions if input is completely empty
    if (!cleanQuery) {
      console.log(`[GET /api/airports] Empty query. Returning default suggestions.`);
      return res.status(200).json(DEFAULT_SUGGESTIONS);
    }

    // 2: Safe partial, case-insensitive regex
    const safeRegexExp = new RegExp(escapeRegex(cleanQuery), "i");

    // Match by name, city, or IATA code 
    const airports = await Airport.find({
      $or: [
        { name: safeRegexExp },
        { city: safeRegexExp },
        { IATA: safeRegexExp }
      ]
    })
    .limit(10)      // Optimizing db queries
    .lean();        // For faster reads, outputs plain JS objects

    // Format output mapping strictly to the frontend requirements
    const formattedResults = airports.map(a => ({
      airport: a.name || "",
      city: a.city || "",
      country: a.country || "",
      IATA: a.IATA || ""
    }));

    // 4: Return default suggested airports if nothing matched
    if (formattedResults.length === 0) {
      console.log(`[GET /api/airports] No matches found for "${cleanQuery}". Returning fallback suggestions.`);
      return res.status(200).json(DEFAULT_SUGGESTIONS);
    }

    console.log(`[GET /api/airports] Found ${formattedResults.length} matches for "${cleanQuery}".`);
    return res.status(200).json(formattedResults);

  } catch (err) {
    // 5: Clean error handling
    console.error(`[GET /api/airports] Error details:`, err.message);
    next(err);
  }
};

module.exports = {
  searchAirports
};
