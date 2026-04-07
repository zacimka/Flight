import React, { useState, useEffect } from 'react';
import { DuffelCardForm, useDuffelCardFormActions, createThreeDSecureSession } from '@duffel/components';
import { getDuffelClientKey } from '../services/api';

const DuffelPaymentIntegration = ({ offerId, totalAmount, onPaymentReady, loadingBooking, errorBooking }) => {
  const [clientKey, setClientKey] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  
  const { ref, createCardForTemporaryUse } = useDuffelCardFormActions();

  useEffect(() => {
    let mounted = true;
    getDuffelClientKey()
      .then(res => {
        if (mounted) {
          setClientKey(res.data.data.client_key);
          setLocalLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch Duffel Client Key", err);
        if (mounted) {
           setLocalError("Payment gateway initialization failed. Try refreshing.");
           setLocalLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  const handleCreateCardSuccess = async (data) => {
    setLocalLoading(true);
    setLocalError(null);
    try {
      const cardId = data.id;
      // Initialize 3DS auth requirement
      const session = await createThreeDSecureSession(
        clientKey,
        cardId,
        offerId,
        [], // no extra services for simple flight booking payload mappings ATM
        true // Cardholder present
      );

      if (session.status === 'ready_for_payment' || session.status === 'authenticated') {
         onPaymentReady({
            type: 'card',
            amount: totalAmount,
            three_d_secure_session_id: session.id
         });
      } else {
         throw new Error(`3DS session status is invalid: ${session.status}`);
      }
    } catch (error) {
       console.error("3DS Error:", error);
       setLocalError(error.message || "Failed to authenticate card details via 3D Secure.");
       setLocalLoading(false);
    }
  };

  const handleCreateCardFailure = (error) => {
     setLocalError(error.message || "Invalid card details. Please check your inputs.");
     setLocalLoading(false);
  };

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderType, setOrderType] = useState('instant');

  const handleNonCardPayment = () => {
     setLocalLoading(true);
     setLocalError(null);
     onPaymentReady({
        type: orderType === 'hold' ? 'balance' : paymentMethod, 
        order_type: orderType,
        amount: totalAmount
     });
  };

  if (localLoading && !clientKey && orderType !== 'hold') {
     return <div className="p-8 text-center text-gray-500 animate-pulse font-bold">Initializing Security Gateways...</div>;
  }

  return (
    <div className="space-y-6">
       {/* Error Banner */}
       {(localError || errorBooking) && (
         <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl shadow-sm text-red-700 font-bold">
            ⚠️ {localError || errorBooking}
         </div>
       )}

       {/* Order Type Toggle */}
       <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full max-w-sm mb-6">
          <button
            onClick={(e) => { e.preventDefault(); setOrderType('instant'); }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-black transition-all ${orderType === 'instant' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            💳 Pay Now
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setOrderType('hold'); }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-black transition-all ${orderType === 'hold' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ⏳ Hold Order
          </button>
       </div>

       {orderType === 'hold' ? (
         <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-inner">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⚠️</span>
              <h4 className="font-black text-amber-800 text-lg">Seat & Baggage Warning</h4>
            </div>
            <p className="text-amber-700 text-sm font-bold">
              Seats and baggage cannot be selected when holding an order. Any selected extras will be dropped. You can add them later when you pay for your reservation.
            </p>
            <p className="text-amber-700 text-sm font-bold mt-2">
              Your flight will be held usually for 24-48 hours depending on airline rules.
            </p>
         </div>
       ) : (
         <>
           {/* Payment Method Selector */}
           <div className="flex flex-col md:flex-row gap-3">
              {[
                { id: 'card', label: '💳 Card (Stripe 3DS)', desc: 'Secure PCI-DSS payment' },
                { id: 'balance', label: '💰 Balance', desc: 'Use ZamGo Limit' },
                { id: 'cash', label: '💵 Cash / Wire', desc: 'Mark as Cash (Admin)' }
              ].map(method => (
                 <button
                    key={method.id}
                    onClick={(e) => { e.preventDefault(); setPaymentMethod(method.id); }}
                    type="button"
                    className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${
                      paymentMethod === method.id 
                        ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                        : 'border-gray-100 hover:border-indigo-200 bg-white hover:bg-gray-50'
                    }`}
                 >
                    <div className="font-black text-gray-900">{method.label}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{method.desc}</div>
                 </button>
              ))}
           </div>

           {/* Card Form */}
           {paymentMethod === 'card' && (
             <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 shadow-inner overflow-hidden min-h-[350px]">
                {clientKey ? (
                  <DuffelCardForm
                    ref={ref}
                    clientKey={clientKey}
                    intent="to-create-card-for-temporary-use"
                    onCreateCardForTemporaryUseSuccess={handleCreateCardSuccess}
                    onCreateCardForTemporaryUseFailure={handleCreateCardFailure}
                  />
                ) : (
                  <p className="text-gray-500 text-center animate-pulse">Loading PCI Gateway...</p>
                )}
             </div>
           )}
         </>
       )}

       {/* Action Button */}
       <div className="flex justify-end pt-4">
          <button 
             onClick={(e) => {
                 e.preventDefault(); 
                 if (orderType === 'instant' && paymentMethod === 'card') {
                    setLocalLoading(true);
                    createCardForTemporaryUse();
                 } else {
                    handleNonCardPayment();
                 }
             }}
             disabled={localLoading || loadingBooking}
             type="button"
             className="w-full md:w-auto px-12 py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl hover:bg-indigo-700 hover:-translate-y-1 transform transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {loadingBooking 
               ? 'Confirming with Vendor...' 
               : localLoading 
                 ? 'Processing...' 
                 : orderType === 'hold'
                   ? 'Reserve Space (Hold API)'
                   : paymentMethod === 'card' 
                     ? 'Authorize & Issue Ticket' 
                     : `Confirm Booking via ${paymentMethod === 'cash' ? 'Cash' : 'Balance'}`
             }
          </button>
       </div>
    </div>
  );
};

export default DuffelPaymentIntegration;
