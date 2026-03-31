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
  };

  if (localLoading && !clientKey) {
     return <div className="p-8 text-center text-gray-500 animate-pulse font-bold">Initializing PCI-DSS Secure Gateway...</div>;
  }

  if (localError) {
     return <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm font-bold border-red-200 border">⚠️ {localError}</div>;
  }

  return (
    <div className="space-y-6">
       <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 shadow-inner overflow-hidden min-h-[350px]">
          {clientKey && (
            <DuffelCardForm
              ref={ref}
              clientKey={clientKey}
              intent="to-create-card-for-temporary-use"
              onCreateCardForTemporaryUseSuccess={handleCreateCardSuccess}
              onCreateCardForTemporaryUseFailure={handleCreateCardFailure}
            />
          )}
       </div>

       {errorBooking && (
         <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl shadow-sm text-red-700 font-bold">
            ⚠️ {errorBooking}
         </div>
       )}

       <div className="flex justify-end pt-4">
          <button 
             onClick={(e) => {
                 e.preventDefault(); 
                 setLocalLoading(true);
                 createCardForTemporaryUse(); 
             }}
             disabled={localLoading || loadingBooking}
             type="button"
             className="w-full md:w-auto px-12 py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl hover:bg-indigo-700 hover:-translate-y-1 transform transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {loadingBooking ? 'Confirming with Vendor...' : localLoading ? 'Authenticating Card...' : 'Authorize Target Flight'}
          </button>
       </div>
    </div>
  );
};

export default DuffelPaymentIntegration;
