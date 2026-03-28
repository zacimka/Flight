const express = require("express");
const router = express.Router();
const { searchAirports } = require("../controllers/airportController");

// @route   GET /api/airports/search?q=[User Query]
// @desc    Search for airports matching query, returning top 10 matches
// @access  Public
router.get("/", searchAirports);
router.get("/search", searchAirports);

module.exports = router;
