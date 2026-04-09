import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { createDuffelPaymentIntent } from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1f2937',
      fontFamily: '"Inter", "Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#9ca3af'
      }
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444'
    }
  }
};

const CustomCheckoutForm = ({ user, offerId, totalAmount, onPaymentReady, loadingBooking, errorBooking }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState(user?.name || '');
  const [error, setError] = useState(errorBooking || null);
  const [loading, setLoading] = useState(false);
  const [finalPriceWithMarkup, setFinalPriceWithMarkup] = useState(0);

  // Initializing Payment Intent (Backend Calculates Markup + Returns Client Secret)
  useEffect(() => {
    let mounted = true;
    const fetchIntent = async () => {
      try {
        const res = await createDuffelPaymentIntent({ offer_id: offerId }, user.token);
        if (mounted) {
          setClientSecret(res.data.clientSecret);
          setFinalPriceWithMarkup(res.data.totalAmount);
        }
      } catch (err) {
        if (mounted) setError('Failed to initialize secure payment. Refresh to try again.');
      }
    };
    if (offerId && user?.token) fetchIntent();
    return () => { mounted = false; };
  }, [offerId, user?.token]);

  useEffect(() => {
     if (errorBooking) setError(errorBooking);
  }, [errorBooking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardNumberElement);

    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: cardholderName,
          email: user?.email
        }
      }
    });

    if (paymentError) {
      setError(paymentError.message);
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Pass control to DuffelBookingFlow to finalize the order via backend Duffel endpoint
      onPaymentReady({
         type: 'stripe',
         paymentIntentId: paymentIntent.id,
         totalPricePaid: finalPriceWithMarkup
      });
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-red-700 font-bold mb-4 animate-in fade-in">
          ⚠️ {error}
        </div>
      )}

      {!clientSecret && !error ? (
        <div className="animate-pulse space-y-4">
           <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
           <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
           <p className="text-gray-400 font-bold text-center text-sm">Securing payment link...</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
             <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className={inputClass}
                />
             </div>
             
             <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Card Number</label>
                <div className={inputClass}>
                   <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Expiration Date</label>
                   <div className={inputClass}>
                      <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">CVC / CVC</label>
                   <div className={inputClass}>
                      <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                   </div>
                </div>
             </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!stripe || !clientSecret || loading || loadingBooking}
              className="w-full py-4 bg-gray-900 text-white font-black text-lg rounded-2xl hover:bg-black transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            >
              {(loading || loadingBooking) ? (
                 <>
                   <span className="w-5 h-5 border-4 border-indigo-200 border-t-white rounded-full animate-spin"></span>
                   Processing Transaction...
                 </>
              ) : (
                 `Confirm Payment (£${totalAmount})`
              )}
            </button>
            <p className="text-center text-[10px] text-gray-400 font-black mt-4 uppercase tracking-widest">
              🔒 256-bit encryption. Payments securely processed by Stripe.
            </p>
          </div>
        </>
      )}
    </form>
  );
};

const DuffelPaymentIntegration = (props) => {
  return (
    <Elements stripe={stripePromise}>
       <CustomCheckoutForm {...props} />
    </Elements>
  );
};

export default DuffelPaymentIntegration;
