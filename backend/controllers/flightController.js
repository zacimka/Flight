const { searchFlights } = require('../services/traveloproService');
const Markup = require('../models/Markup');

const applyMarkup = (price, markup) => {
  if (markup.type === 'percentage') {
    return price + price * (markup.value / 100);
  }
  return price + markup.value;
};

const findActiveMarkup = async () => {
  const markup = await Markup.findOne().sort('-createdAt');
  if (!markup) return { type: 'fixed', value: 0 };
  return markup;
};

const getFlights = async (req, res, next) => {
  try {
    const criteria = req.body;
    const flights = await searchFlights(criteria);
    const markup = await findActiveMarkup();

    const flightsWithMarkup = flights.results.map((f) => {
      const basePrice = f.price || 0;
      const finalPrice = applyMarkup(basePrice, markup);
      return { ...f, basePrice, finalPrice };
    });

    res.json({ data: flightsWithMarkup, markup });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFlights };
