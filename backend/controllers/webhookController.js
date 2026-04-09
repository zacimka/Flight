const Stripe = require('stripe');
const getStripe = () => Stripe(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendTicketEmail } = require('../services/emailService');

const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const booking = await Booking.findOne({ paymentIntentId: paymentIntent.id });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      booking.status = 'paid';
      booking.paymentId = paymentIntent.charges?.data?.[0]?.id;
      await booking.save();

      const user = await User.findById(booking.userId);
      if (user) {
        await sendTicketEmail(user.email, { ...booking.toObject(), userId: { name: user.name, email: user.email } });
      }
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object;
      const booking = await Booking.findOne({ paymentId: charge.id });
      if (booking) {
        booking.status = 'refunded';
        await booking.save();
      }
      break;
    }
    default:
      console.log('Unhandled event type', event.type);
  }

  res.json({ received: true });
};

module.exports = { stripeWebhookHandler };
