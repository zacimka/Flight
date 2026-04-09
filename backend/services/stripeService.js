const Stripe = require('stripe');
const getStripe = () => Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  if (process.env.STRIPE_SECRET_KEY === 'your_stripe_secret_key_here') {
    const mockId = `pi_mock_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: mockId,
      client_secret: `${mockId}_secret`,
    };
  }

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
  if (id.startsWith('pi_mock_')) {
    return {
      id,
      status: id.includes('failed') ? 'requires_payment_method' : 'succeeded',
      amount: 1000,
      client_secret: `${id}_secret`,
    };
  }
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
