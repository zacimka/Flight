const { searchFlights } = require('../services/traveloproService');
const Markup = require('../models/Markup');

const applyMarkup = (price, markup) => {
  const numericPrice = Number(price) || 0;
  const markupValue = Number(markup.value) || 0;
  if (markup.type === 'percentage') {
    return numericPrice + numericPrice * (markupValue / 100);
  }
  return numericPrice + markupValue;
};

const findActiveMarkup = async () => {
  const markup = await Markup.findOne().sort('-createdAt');
  if (!markup) return { type: 'fixed', value: 0 };
  return markup;
};

const getFlights = async (req, res, next) => {
  try {
    const criteria = req.body;
    console.log(`[POST /api/flights/search] Request Criteria:`, criteria);

    const flights = await searchFlights(criteria);
    const markup = await findActiveMarkup();

    const flightsWithMarkup = flights.results.map((f) => {
      const basePrice = f.price || 0;
      const finalPrice = applyMarkup(basePrice, markup);
      return { ...f, basePrice, finalPrice };
    });

    console.log(`[POST /api/flights/search] Found ${flightsWithMarkup.length} flights.`);
    res.status(200).json({ data: flightsWithMarkup, markup });
  } catch (err) {
    console.error(`[POST /api/flights/search] Error details:`, err.message);
    next(err);
  }
};

module.exports = { getFlights };
