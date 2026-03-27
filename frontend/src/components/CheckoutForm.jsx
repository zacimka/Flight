import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const CheckoutForm = ({ clientSecret, onPaymentSuccess, onPaymentError, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    if (clientSecret.startsWith('pi_mock_secret_')) {
      // Simulate real confirmation delay
      setTimeout(() => {
        // Mock failure if the secret includes 'fail'
        if (clientSecret.includes('fail')) {
          onPaymentError("Your card was declined. Please try another card.");
          setProcessing(false);
        } else {
          // Default mock success (uses the generated ID from backend)
          // Strip '_secret' from 'pi_mock_xxxxxx_secret' to get the PI ID
          const mockIntentId = clientSecret.replace('_secret', '');
          onPaymentSuccess({ status: 'succeeded', id: mockIntentId });
        }
      }, 1500);
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (result.error) {
      onPaymentError(result.error.message);
      setProcessing(false);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        onPaymentSuccess(result.paymentIntent);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg bg-gray-50">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }} />
      </div>
      <button
        disabled={!stripe || processing}
        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {processing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </button>
    </form>
  );
};

export default CheckoutForm;
