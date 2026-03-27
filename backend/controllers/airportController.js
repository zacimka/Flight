const Airport = require("../models/Airport"); // Ensure you have this model

const searchAirports = async (req, res, next) => {
  try {
    const query = req.query.q || "";

    if (!query) {
      return res.status(200).json([]);
    }

    // Search by name, city, or IATA code
    // Using simple regex for case-insensitive partial match
    const regex = new RegExp(query, "i");

    const airports = await Airport.find({
      $or: [
        { name: regex },
        { city: regex },
        { IATA: regex }
      ]
    })
    .limit(10)      // Limit to top 10 matches
    .lean();        // Faster reads

    // Format output to precisely match requested example:
    // "airport": "Charles de Gaulle Airport", "city": "Paris", "country": "France", "IATA": "CDG"
    const formattedResults = airports.map(a => ({
      airport: a.name || "",
      city: a.city || "",
      country: a.country || "",
      IATA: a.IATA || ""
    }));

    return res.status(200).json(formattedResults);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  searchAirports
};
