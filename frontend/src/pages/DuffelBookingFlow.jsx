import React, { useState, useEffect } from 'react';
import { duffelSearchFlights, getDuffelOffer, createDuffelBooking } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import DuffelPaymentIntegration from '../components/DuffelPaymentIntegration';
import DuffelAncillariesPanel from '../components/DuffelAncillariesPanel';

const CABIN_CLASSES = ['economy', 'premium_economy', 'business', 'first'];

const DuffelBookingFlow = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('SEARCH');   // SEARCH → SELECT_OFFER → ANCILLARIES → PASSENGER_DETAILS
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── SEARCH STATE ─────────────────────────────────────────────────────────
  const [searchParams, setSearchParams] = useState({
    origin: location.state?.origin || '', destination: location.state?.destination || '',
    departure_date: location.state?.departure_date || '', return_date: location.state?.return_date || '',
    adults: location.state?.adults || 1, children: location.state?.children || 0,
    cabin_class: location.state?.cabin_class || 'economy',
    // Private fares / loyalty
    corporate_code: '',       // e.g. "CORP123" → sent to matching airline
    airline_iata_for_corp: '', // e.g. "QF" or "BA"
    loyalty_account_number: '',
    loyalty_airline_iata: '',
  });

  useEffect(() => {
     // Auto trigger search if coming from homepage with populated mandatory fields
     if (location.state?.origin && location.state?.destination && location.state?.departure_date) {
        // We synthesize an event-like object to satisfy fetchOffers(e)
        fetchOffers({ preventDefault: () => {} });
     }
  }, []);

  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState([]);

  // ── ANCILLARY STATE ───────────────────────────────────────────────────────
  const [ancillaryServices, setAncillaryServices] = useState([]); // [{ id, quantity }]
  const [ancillaryTotal, setAncillaryTotal] = useState(null);     // { total, currency }

  // ── HANDLERS ──────────────────────────────────────────────────────────────
  const set = (field) => (e) =>
    setSearchParams(prev => ({ ...prev, [field]: e.target.value }));

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengerDetails];
    updated[index][field] = value;
    setPassengerDetails(updated);
  };

  // Step 1: Search
  const fetchOffers = async (e) => {
    e.preventDefault();
    if (!searchParams.origin || !searchParams.destination || !searchParams.departure_date)
      return setError('Origin, destination and departure date are required.');

    setLoading(true);
    setError(null);
    try {
      const payload = {
        origin: searchParams.origin.toUpperCase(),
        destination: searchParams.destination.toUpperCase(),
        departure_date: searchParams.departure_date,
        adults: parseInt(searchParams.adults),
        children: parseInt(searchParams.children || 0),
        cabin_class: searchParams.cabin_class,
      };

      if (searchParams.return_date) payload.return_date = searchParams.return_date;

      // Private fares: corporate code per airline
      if (searchParams.corporate_code && searchParams.airline_iata_for_corp) {
        payload.private_fares = {
          [searchParams.airline_iata_for_corp.toUpperCase()]: [
            { corporate_code: searchParams.corporate_code }
          ]
        };
      }

      // Loyalty programme accounts
      if (searchParams.loyalty_account_number && searchParams.loyalty_airline_iata) {
        payload.loyalty_programme_accounts = [{
          airline_iata_code: searchParams.loyalty_airline_iata.toUpperCase(),
          account_number: searchParams.loyalty_account_number
        }];
      }

      const res = await duffelSearchFlights(payload);
      setOffers(res.data.data.offers || []);
      if ((res.data.data.offers || []).length === 0)
        setError('No offers found for this route. Try different dates or connections.');
      else setStep('SELECT_OFFER');
    } catch (err) {
      setError(err.response?.data?.details || err.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Select offer → load full details
  const confirmOfferSelection = async (offer_id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDuffelOffer(offer_id);
      const refreshed = res.data.data;
      setSelectedOffer(refreshed);
      setPassengerDetails(refreshed.passengers.map(p => ({
        id: p.id, type: p.type,
        given_name: '', family_name: '',
        born_on: '', gender: 'm',
        title: p.type === 'adult' ? 'mr' : 'mstr',
        email: user?.email || '', phone_number: ''
      })));
      setAncillaryServices([]);
      setAncillaryTotal(null);
      setStep('ANCILLARIES');
    } catch (err) {
      setError(err.response?.data?.details || err.message || 'Offer refresh failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Ancillaries callback
  const handleAncillariesReady = (services, totals) => {
    setAncillaryServices(services);
    setAncillaryTotal(totals);
  };

  // Step 4: After 3DS card auth → create order
  const createOrder = async (paymentData) => {
    if (!user) return setError('Login required to complete booking.');
    setLoading(true);
    setError(null);
    try {
      // Calculate grand total: offer price + ancillary markup total
      const offerAmount = parseFloat(selectedOffer.total_amount);
      const ancillaryAmount = parseFloat(ancillaryTotal?.total || 0);
      const grandTotal = (offerAmount + ancillaryAmount).toFixed(2);

      const payload = {
        offer_id: selectedOffer.offer_id,
        total_amount: grandTotal,
        services: ancillaryServices.filter(s => s.quantity > 0),
        passengers: passengerDetails,
        payment_type: 'card', 
        payment_id: paymentData.three_d_secure_session_id,
        metadata: {
           customer_id: user.id || "GUEST",
           booking_channel: "Zamgo_Web_Checkout"
        }
      };

      const res = await createDuffelBooking(payload, user.token);
      const ref = res.data.data.booking_reference;
      alert(`✅ Booking confirmed! Reference: ${ref}`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.debug || err.response?.data?.details || err.message || 'Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  const STEP_LABELS = ['Search', 'Select', 'Extras', 'Pay'];
  const STEP_KEYS   = ['SEARCH', 'SELECT_OFFER', 'ANCILLARIES', 'PASSENGER_DETAILS'];
  const stepIndex   = STEP_KEYS.indexOf(step);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">ZamGo Live Booking</h1>
          <p className="text-gray-400 font-medium">Powered by Duffel — real-time airline inventory</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-center gap-2">
          {STEP_LABELS.map((label, i) => (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                i <= stepIndex
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-gray-400 border border-gray-200'
              }`}>
                <span>{i + 1}</span> {label}
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`h-px w-6 transition-all ${i < stepIndex ? 'bg-indigo-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-red-700 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* ══ STEP 1: SEARCH ══════════════════════════════════════════════ */}
        {step === 'SEARCH' && (
          <form onSubmit={fetchOffers} className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 space-y-6">
            {/* Route & dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'From (IATA)', field: 'origin', placeholder: 'LHR', max: 3 },
                { label: 'To (IATA)', field: 'destination', placeholder: 'JFK', max: 3 },
                { label: 'Departure', field: 'departure_date', type: 'date' },
                { label: 'Return (optional)', field: 'return_date', type: 'date' },
              ].map(({ label, field, placeholder, type, max }) => (
                <div key={field}>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</label>
                  <input
                    required={['origin','destination','departure_date'].includes(field)}
                    type={type || 'text'} value={searchParams[field]}
                    onChange={set(field)} placeholder={placeholder}
                    maxLength={max}
                    className="w-full p-3 bg-gray-50 rounded-xl font-bold focus:ring-2 focus:ring-indigo-400/30 transition"
                  />
                </div>
              ))}
            </div>

            {/* Passengers & class */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-50 pt-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Adults</label>
                <input type="number" min="1" max="9" value={searchParams.adults} onChange={set('adults')} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-center" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Children</label>
                <input type="number" min="0" max="9" value={searchParams.children} onChange={set('children')} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-center" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Cabin Class</label>
                <select value={searchParams.cabin_class} onChange={set('cabin_class')} className="w-full p-3 bg-gray-50 rounded-xl font-bold">
                  {CABIN_CLASSES.map(c => <option key={c} value={c}>{c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </div>
            </div>

            {/* Private fares / loyalty — collapsible */}
            <details className="border border-dashed border-indigo-200 rounded-2xl p-4 bg-indigo-50/30">
              <summary className="font-black text-sm text-indigo-600 cursor-pointer select-none">
                ✈️ Corporate Fares & Loyalty Programme (optional)
              </summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Airline IATA (e.g. QF, BA)</label>
                  <input value={searchParams.airline_iata_for_corp} onChange={set('airline_iata_for_corp')} placeholder="BA" maxLength={2} className="w-full p-3 bg-white border border-indigo-100 rounded-xl font-bold uppercase" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Corporate / Fare Code</label>
                  <input value={searchParams.corporate_code} onChange={set('corporate_code')} placeholder="CORP123" className="w-full p-3 bg-white border border-indigo-100 rounded-xl font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Loyalty Airline IATA</label>
                  <input value={searchParams.loyalty_airline_iata} onChange={set('loyalty_airline_iata')} placeholder="QF" maxLength={2} className="w-full p-3 bg-white border border-indigo-100 rounded-xl font-bold uppercase" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Frequent Flyer Number</label>
                  <input value={searchParams.loyalty_account_number} onChange={set('loyalty_account_number')} placeholder="QF1234567" className="w-full p-3 bg-white border border-indigo-100 rounded-xl font-bold" />
                </div>
              </div>
            </details>

            <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 transform transition disabled:opacity-50">
              {loading ? 'Searching live inventory…' : '🔍 Search Flights'}
            </button>
          </form>
        )}

        {/* ══ STEP 2: SELECT OFFER ═════════════════════════════════════════ */}
        {step === 'SELECT_OFFER' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-900">{offers.length} Live Offer{offers.length !== 1 ? 's' : ''}</h2>
              <button onClick={() => setStep('SEARCH')} className="text-sm font-bold text-gray-400 hover:text-indigo-600 transition">← New Search</button>
            </div>
            {offers.map(offer => (
              <div key={offer.id} className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-3 items-center flex-wrap">
                    <span className="font-black text-xl text-indigo-600">{offer.owner.name}</span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase">Live Price</span>
                    {offer.private_fares?.length > 0 && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase">Private Fare</span>
                    )}
                  </div>
                  {offer.slices.map((slice, i) => (
                    <p key={i} className="text-sm text-gray-700 font-semibold">
                      <span className="text-gray-400">Leg {i+1}:</span> {slice.origin.name} ({slice.origin.iata_code}) ➔ {slice.destination.name} ({slice.destination.iata_code})
                      <span className="ml-2 bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full">{slice.duration}</span>
                    </p>
                  ))}
                </div>
                <div className="text-right border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total</p>
                  <p className="text-3xl font-black text-gray-900 mb-4">{offer.total_currency} {offer.total_amount}</p>
                  <button onClick={() => confirmOfferSelection(offer.id)} disabled={loading} className="w-full md:w-auto px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow">
                    {loading ? 'Loading…' : 'Select →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ STEP 3: ANCILLARIES (Seats & Bags) ══════════════════════════ */}
        {step === 'ANCILLARIES' && selectedOffer && (
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Seats & Bags</h2>
                <p className="text-sm text-gray-400 font-medium mt-1">Choose extras before payment. Optional — skip to continue.</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Flight Total</p>
                <p className="text-2xl font-black">{selectedOffer.total_currency} {selectedOffer.total_amount}</p>
                {ancillaryTotal?.total > 0 && (
                  <p className="text-sm font-bold text-green-600">+{selectedOffer.total_currency} {ancillaryTotal.total} extras</p>
                )}
              </div>
            </div>

            <DuffelAncillariesPanel
              offerId={selectedOffer.offer_id}
              passengers={selectedOffer.passengers}
              onServicesReady={handleAncillariesReady}
              markupPercent={5}
            />

            <div className="flex justify-between items-center border-t border-gray-100 pt-6">
              <button onClick={() => setStep('SELECT_OFFER')} className="text-gray-400 font-bold hover:text-gray-900 transition">← Back</button>
              <button
                onClick={() => setStep('PASSENGER_DETAILS')}
                className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 hover:-translate-y-0.5 transform transition shadow-lg"
              >
                Continue to Passengers →
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 4: PASSENGERS + PAYMENT ════════════════════════════════ */}
        {step === 'PASSENGER_DETAILS' && selectedOffer && (
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border-t-8 border-indigo-600 space-y-10">
            {/* Header */}
            <div className="flex justify-between items-start pb-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Passenger Details</h2>
                <p className="text-sm text-gray-400 font-medium mt-1">Names must exactly match travel documents.</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Grand Total</p>
                <p className="text-2xl font-black">
                  {selectedOffer.total_currency} {(
                    parseFloat(selectedOffer.total_amount) + parseFloat(ancillaryTotal?.total || 0)
                  ).toFixed(2)}
                </p>
                {ancillaryTotal?.total > 0 && (
                  <p className="text-xs text-gray-400 font-medium">
                    {selectedOffer.total_currency} {selectedOffer.total_amount} flight + {ancillaryTotal.total} extras
                  </p>
                )}
              </div>
            </div>

            {/* Passenger forms */}
            <div className="space-y-10">
              {passengerDetails.map((p, idx) => (
                <div key={p.id} className="space-y-4">
                  <h3 className="flex items-center gap-2 font-black text-indigo-600 uppercase text-xs tracking-widest">
                    <span className="w-6 h-6 bg-indigo-50 rounded-md flex items-center justify-center">{idx + 1}</span>
                    {p.type} Passenger
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Title</label>
                      <select required value={p.title} onChange={e => handlePassengerChange(idx, 'title', e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold">
                        <option value="mr">Mr</option><option value="mrs">Mrs</option><option value="ms">Ms</option><option value="dr">Dr</option><option value="mstr">Master</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Given Name</label>
                      <input required type="text" value={p.given_name} onChange={e => handlePassengerChange(idx, 'given_name', e.target.value)} placeholder="Legal first name" className="w-full p-3 bg-gray-50 rounded-xl font-bold focus:ring-2 focus:ring-indigo-400/30" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Family Name</label>
                      <input required type="text" value={p.family_name} onChange={e => handlePassengerChange(idx, 'family_name', e.target.value)} placeholder="Legal last name" className="w-full p-3 bg-gray-50 rounded-xl font-bold focus:ring-2 focus:ring-indigo-400/30" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Date of Birth</label>
                      <input required type="date" value={p.born_on} onChange={e => handlePassengerChange(idx, 'born_on', e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Gender</label>
                      <select required value={p.gender} onChange={e => handlePassengerChange(idx, 'gender', e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold">
                        <option value="m">Male</option><option value="f">Female</option>
                      </select>
                    </div>
                  </div>
                  {idx === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-2xl">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Email</label>
                        <input required type="email" value={p.email} onChange={e => handlePassengerChange(0, 'email', e.target.value)} placeholder="contact@email.com" className="w-full p-3 bg-white border border-gray-100 rounded-xl font-bold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Phone</label>
                        <input required type="tel" value={p.phone_number} onChange={e => handlePassengerChange(0, 'phone_number', e.target.value)} placeholder="+441234567890" className="w-full p-3 bg-white border border-gray-100 rounded-xl font-bold" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Payment */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h3 className="text-xl font-black text-gray-900 border-l-4 border-indigo-600 pl-4 py-1">
                Secure Payment (PCI-DSS)
              </h3>
              {!user ? (
                <p className="text-red-500 font-bold text-sm bg-red-50 p-4 rounded-xl">You must be logged in to complete payment.</p>
              ) : (
                <DuffelPaymentIntegration
                  offerId={selectedOffer?.offer_id}
                  totalAmount={(parseFloat(selectedOffer.total_amount) + parseFloat(ancillaryTotal?.total || 0)).toFixed(2)}
                  totalCurrency={selectedOffer?.total_currency}
                  onPaymentReady={createOrder}
                  loadingBooking={loading}
                  errorBooking={null}
                />
              )}
            </div>

            <div className="flex border-t border-gray-100 pt-6">
              <button type="button" onClick={() => setStep('ANCILLARIES')} className="text-gray-400 font-bold hover:text-gray-900 transition">← Back to Extras</button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
};

export default DuffelBookingFlow;
