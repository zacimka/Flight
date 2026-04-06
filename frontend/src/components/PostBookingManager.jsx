import React, { useState } from 'react';
import { getOrderServices, addOrderServices, createCancellationQuote, confirmCancellation } from '../services/api';

/**
 * PostBookingManager
 *
 * Props:
 *   orderId  – Duffel order ID (ord_...)
 *   user     – authenticated user object (needs .token)
 */
const PostBookingManager = ({ orderId, user }) => {
  const [tab, setTab] = useState('bags'); // 'bags' | 'cancel'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Bags flow
  const [availableServices, setAvailableServices] = useState(null);
  const [selectedBags, setSelectedBags] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('balance');

  // Cancellation flow
  const [quote, setQuote] = useState(null);
  const [cancellationConfirmed, setCancellationConfirmed] = useState(false);

  // ── Bags ──────────────────────────────────────────────────────────────
  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrderServices(orderId, user.token);
      setAvailableServices(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch available services.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBag = (serviceId, qty) => {
    setSelectedBags(prev => ({ ...prev, [serviceId]: qty }));
  };

  const handleAddBags = async () => {
    const services = Object.entries(selectedBags)
      .filter(([, qty]) => qty > 0)
      .map(([id, quantity]) => ({ id, quantity }));

    if (!services.length) return setError('Select at least one bag to add.');
    const total = availableServices
      .filter(s => selectedBags[s.id] > 0)
      .reduce((sum, s) => sum + parseFloat(s.total_amount) * selectedBags[s.id], 0);

    setLoading(true);
    setError(null);
    try {
      await addOrderServices(orderId, {
        services,
        payment: { type: paymentMethod, amount: total.toFixed(2), currency: 'GBP' }
      }, user.token);
      setSuccess('Extra bags added successfully!');
    } catch (err) {
      setError(err.response?.data?.details || 'Failed to add services.');
    } finally {
      setLoading(false);
    }
  };

  // ── Cancellation ───────────────────────────────────────────────────────
  const fetchQuote = async () => {
    setLoading(true);
    setError(null);
    setQuote(null);
    try {
      const res = await createCancellationQuote({ order_id: orderId }, user.token);
      setQuote(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate cancellation quote.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!quote?.cancellation_id) return;
    if (!window.confirm('Are you sure you want to permanently cancel this booking?')) return;
    setLoading(true);
    setError(null);
    try {
      await confirmCancellation(quote.cancellation_id, user.token);
      setCancellationConfirmed(true);
      setSuccess('Booking cancelled. Refund will be processed shortly.');
    } catch (err) {
      setError(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100">
        {[['bags', '🧳 Add Bags'], ['cancel', '❌ Cancel Order']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setError(null); setSuccess(null); }}
            className={`flex-1 py-4 font-black text-sm transition-all ${
              tab === key
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-8 space-y-6">
        {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-red-700 font-semibold">⚠️ {error}</div>}
        {success && <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl text-green-700 font-semibold">✅ {success}</div>}

        {/* ── BAGS TAB ── */}
        {tab === 'bags' && !cancellationConfirmed && (
          <div className="space-y-6">
            <p className="text-gray-500 text-sm font-medium">Fetch available extra bag options for this booking and add them directly.</p>

            {!availableServices ? (
              <button
                onClick={fetchServices}
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Show Available Bags'}
              </button>
            ) : availableServices.length === 0 ? (
              <p className="text-center text-gray-400 font-semibold py-6">No additional bag services available for this order.</p>
            ) : (
              <div className="space-y-3">
                {availableServices
                  .filter(s => s.type === 'baggage')
                  .map(service => (
                    <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <p className="font-bold text-gray-900">{service.metadata?.maximum_weight_kg}kg Checked Bag</p>
                        <p className="text-xs text-gray-400 font-medium">{service.metadata?.description || service.type}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-indigo-600">{service.total_currency} {service.total_amount}</span>
                        <select
                          onChange={e => toggleBag(service.id, parseInt(e.target.value))}
                          className="p-2 rounded-xl bg-white border border-gray-200 font-bold text-sm"
                        >
                          {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n === 0 ? 'None' : `× ${n}`}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}

                <div className="pt-4 flex items-center gap-4">
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-sm"
                  >
                    <option value="balance">Duffel Balance</option>
                    <option value="arc_bsp_cash">ARC/BSP Cash</option>
                  </select>
                  <button
                    onClick={handleAddBags}
                    disabled={loading}
                    className="flex-1 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition disabled:opacity-50"
                  >
                    {loading ? 'Processing…' : 'Add Selected Bags'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CANCEL TAB ── */}
        {tab === 'cancel' && !cancellationConfirmed && (
          <div className="space-y-6">
            <p className="text-gray-500 text-sm font-medium">
              Get a refund quote first. You only confirm cancellation after reviewing the amounts.
            </p>

            {!quote ? (
              <button
                onClick={fetchQuote}
                disabled={loading}
                className="w-full py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition disabled:opacity-50"
              >
                {loading ? 'Calculating…' : 'Get Cancellation Quote'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-5 rounded-2xl text-center border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Refund Amount</p>
                    <p className="text-2xl font-black text-green-600">{quote.refund_currency} {quote.refund_amount}</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl text-center border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Refund Method</p>
                    <p className="text-base font-black text-gray-700 capitalize">{(quote.refund_to || 'original payment').replace(/_/g, ' ')}</p>
                  </div>
                </div>

                {quote.airline_credits?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-amber-700 text-sm font-semibold">
                    ✈️ Airline credits may be issued instead of a full cash refund. Check with your airline.
                  </div>
                )}

                <p className="text-xs text-gray-400 font-medium">
                  Quote valid until: {new Date(quote.expires_at).toLocaleString()}
                </p>

                <button
                  onClick={handleConfirmCancellation}
                  disabled={loading}
                  className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? 'Cancelling…' : '⚠️ Confirm Permanent Cancellation'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostBookingManager;
