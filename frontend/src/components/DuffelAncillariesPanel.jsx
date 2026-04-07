import React, { useState, useEffect } from 'react';
import { DuffelAncillaries } from '@duffel/components';
import { getDuffelClientKey } from '../services/api';

/**
 * DuffelAncillariesPanel
 *
 * Props:
 *   offerId         – Duffel offer ID
 *   passengers      – array of Duffel passenger objects (with .id)
 *   onServicesReady – callback(services, totalServicesAmount)
 *   markupPercent   – optional integer markup % (e.g. 10 = 10%)
 *   markupFixed     – optional fixed markup amount per order
 */
const DuffelAncillariesPanel = ({
  offerId,
  passengers,
  services,
  onServicesReady,
  markupPercent = 0,
  markupFixed = 0
}) => {
  const [clientKey, setClientKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    let mounted = true;
    getDuffelClientKey()
      .then(res => {
        if (mounted) {
          setClientKey(res.data.data.client_key);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Failed to initialise ancillaries gateway.');
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  // ZamGo Tiered Fixed Markup (matches backend logic exactly)
  const applyMarkup = (amount, currency) => {
    const base = parseFloat(amount || 0);
    let markup = 0;
    if (base < 100)       markup = 15;
    else if (base < 500)  markup = 30;
    else                  markup = 50;
    return { amount: (base + markup).toFixed(2), markup, currency };
  };

  const handlePayloadReady = (payload) => {
    // payload contains { services: [{ id, quantity }], ... }
    const selected = payload.services || [];
    const rawTotal = selected.reduce((sum, s) => {
      const unitPrice = parseFloat(s.total_amount || s.amount || 0);
      return sum + unitPrice * (s.quantity || 1);
    }, 0);
    const { amount: markedUpTotal, currency } = applyMarkup(rawTotal, payload.currency);
    setSelectedServices(selected);
    onServicesReady?.(selected, { total: markedUpTotal, currency, raw: rawTotal.toFixed(2) });
  };

  if (loading) return (
    <div className="flex items-center gap-3 p-6 text-gray-500 animate-pulse">
      <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      <span className="font-semibold">Loading seats & baggage options…</span>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-semibold">⚠️ {error}</div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
          <span className="text-2xl">🪑</span> Seats & Baggage
        </h3>
        {(markupPercent > 0 || markupFixed > 0) && (
          <span className="text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-200">
            {markupPercent > 0 ? `+${markupPercent}% markup` : ''}{markupFixed > 0 ? ` +${markupFixed} fixed` : ''}
          </span>
        )}
      </div>

      {clientKey && services?.length > 0 ? (
        <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
          <DuffelAncillaries
            offer_id={offerId}
            client_key={clientKey}
            passengers={passengers}
            services={['bags', 'seats']}
            onPayloadReady={handlePayloadReady}
            styles={{
              accentColor: '#4f46e5',           // Indigo – ZamGo brand
              fontFamily: 'Inter, sans-serif',
              buttonCornerRadius: '12px',
            }}
          />
        </div>
      ) : clientKey ? (
        <div className="bg-gray-50 text-gray-500 p-8 rounded-2xl border border-gray-100 text-center font-bold">
           No extra services are currently available for this specific flight.
        </div>
      ) : null}

      {selectedServices.length > 0 && (
        <div className="bg-indigo-50 rounded-2xl p-4 flex items-center gap-3 border border-indigo-100">
          <span className="text-indigo-600 font-black">✓</span>
          <span className="text-sm font-semibold text-indigo-700">
            {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
          </span>
        </div>
      )}
    </div>
  );
};

export default DuffelAncillariesPanel;
