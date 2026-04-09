const Stripe = require('stripe');
const getStripe = () => Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
    automatic_payment_methods: { enabled: true }
  });
  return paymentIntent;
};

const retrievePaymentIntent = async (id) => {
  const stripe = getStripe();
  return stripe.paymentIntents.retrieve(id);
};

const createRefund = async (paymentIntentId, amount) => {
  const stripe = getStripe();
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: Math.round(amount * 100)
  });
  return refund;
};

module.exports = { createPaymentIntent, retrievePaymentIntent, createRefund };
