import React, { useState, useEffect, useRef } from 'react';
import { duffelSearchFlights, getDuffelOffer, createDuffelBooking } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import DuffelPaymentIntegration from '../components/DuffelPaymentIntegration';
import DuffelAncillariesPanel from '../components/DuffelAncillariesPanel';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-900 min-h-screen font-mono">
          <h1 className="text-3xl font-black mb-4">React App Crashed (Blank Page Fix)</h1>
          <p className="mb-4">The UI hit an unhandled exception during render. Please copy the error message below:</p>
          <pre className="bg-red-900 text-red-100 p-4 rounded-xl overflow-x-auto">
            {this.state.error?.toString()}
            <br />
            {this.state.error?.stack}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

  const resultsRef = useRef(null);

  useEffect(() => {
     if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
     }
  }, [step]);

  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [expandedOfferId, setExpandedOfferId] = useState(null);
  const [processingOfferId, setProcessingOfferId] = useState(null);
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
        setError('Ma jiro duulimaad taariikhdan, fadlan isku day maalin kale.');
      else setStep('SELECT_OFFER');
    } catch (err) {
      setError(err.response?.data?.details || err.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const confirmOfferSelection = async (offer_id) => {
    setProcessingOfferId(offer_id);
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
      setProcessingOfferId(null);
    }
  };

  const handleAncillariesReady = (services, totals) => {
    setAncillaryServices(services);
    setAncillaryTotal(totals);
  };

  const createOrder = async (paymentData) => {
    if (!user) return setError('Login required to complete booking.');
    setLoading(true);
    setError(null);
    try {
      const offerAmount = parseFloat(selectedOffer.total_amount);
      const ancillaryAmount = parseFloat(ancillaryTotal?.total || 0);
      const grandTotal = (offerAmount + ancillaryAmount).toFixed(2);

      const payload = {
        offer_id: selectedOffer.offer_id,
        total_amount: grandTotal,
        services: ancillaryServices.filter(s => s.quantity > 0),
        passengers: passengerDetails,
        payment_type: paymentData.type, 
        payment_id: paymentData.three_d_secure_session_id,
        order_type: paymentData.order_type || 'instant',
        metadata: {
           customer_id: user.id || "GUEST",
           booking_channel: "Zamgo_Web_Checkout"
        }
      };

      // Duffel doesn't allow services on held orders
      if (payload.order_type === 'hold') {
         payload.services = [];
      }

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

  const STEP_LABELS = ['Search', 'Select', 'Extras', 'Pay'];
  const STEP_KEYS   = ['SEARCH', 'SELECT_OFFER', 'ANCILLARIES', 'PASSENGER_DETAILS'];
  const stepIndex   = STEP_KEYS.indexOf(step);

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-12 px-4 sm:px-6 lg:px-8">
        {/* ... existing content ... */}
        <div ref={resultsRef} className="max-w-5xl mx-auto space-y-8">

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">ZamGo Live Booking</h1>
          <p className="text-gray-400 font-medium">Powered by Duffel — real-time airline inventory</p>
        </div>

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

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-red-700 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {step === 'SEARCH' && loading && (
          <div className="bg-white p-16 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col items-center justify-center space-y-6">
             <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
             <h2 className="text-2xl font-black text-gray-900">Raadin Ayaa Socota...</h2>
             <p className="text-gray-500 font-medium">Searching live Duffel inventory for the best prices.</p>
          </div>
        )}

        {step === 'SEARCH' && !loading && (
          <div className="bg-white p-16 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col items-center justify-center space-y-6 text-center">
             <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl">✈️</div>
             <h2 className="text-2xl font-black text-gray-900">{error ? "Hubin Fashilantay" : "No Search Initiated"}</h2>
             <p className="text-gray-500 font-medium">{error ? "Natiijo lamah helin raadintaada." : "Please start your flight search from the home page."}</p>
             <button onClick={() => navigate('/')} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition">
               ← Go to Home
             </button>
          </div>
        )}

        {/* ══ STEP 2: SELECT OFFER ═════════════════════════════════════════ */}
        {step === 'SELECT_OFFER' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-900">{offers.length} Live Offer{offers.length !== 1 ? 's' : ''}</h2>
              <button onClick={() => navigate('/')} className="text-sm font-bold text-gray-400 hover:text-indigo-600 transition">← New Search</button>
            </div>
            {offers.map(offer => (
              <div 
                key={offer.id} 
                onClick={(e) => {
                   if (e.target.tagName !== 'BUTTON') setExpandedOfferId(prev => prev === offer.id ? null : offer.id);
                }} 
                className={`bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition border cursor-pointer overflow-hidden ${expandedOfferId === offer.id ? 'border-indigo-400 border-2' : 'border-gray-100'}`}
              >
                <div className="p-6 flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-3 items-center flex-wrap">
                      {offer.owner?.logo_symbol_url && (
                         <img src={offer.owner.logo_symbol_url} alt="Logo" className="w-8 h-8 rounded-md object-contain" />
                      )}
                      <span className="font-black text-xl text-indigo-600">
                        {offer.owner?.name || offer.slices?.[0]?.segments?.[0]?.operating_carrier?.name || 'Airline'}
                      </span>
                      <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        Live Price
                      </span>
                      {offer.private_fares?.length > 0 && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          Private Fare
                        </span>
                      )}
                    </div>
                    {offer.slices.map((slice, i) => (
                      <div key={i} className="flex flex-col gap-1 border-l-2 border-indigo-100 pl-4 py-1">
                        <p className="text-sm text-gray-800 font-bold">
                          <span className="text-gray-400 font-medium">Leg {i+1}: </span> 
                          {new Date(slice.segments[0].departing_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} {slice.origin.iata_code} ➔ {new Date(slice.segments[slice.segments.length-1].arriving_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} {slice.destination.iata_code}
                        </p>
                        <p className="text-xs text-gray-500 font-semibold gap-2 flex items-center">
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full text-indigo-600">{slice.duration}</span>
                          {slice.segments.length > 1 && <span className="text-amber-500">{slice.segments.length - 1} Stop(s)</span>}
                          <span>👜 Carry-on & checked bags per fare rules</span>
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="text-right border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total</p>
                    <p className="text-3xl font-black text-gray-900 mb-4">{offer.total_currency} {offer.total_amount}</p>
                    <button onClick={() => confirmOfferSelection(offer.id)} disabled={loading} className={`w-full md:w-auto px-8 py-3 ${loading && processingOfferId === offer.id ? 'bg-indigo-800' : 'bg-indigo-600'} text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg relative z-10`}>
                      {loading && processingOfferId === offer.id ? 'Processing…' : 'Select →'}
                    </button>
                    <p className="text-xs text-indigo-400 mt-3 font-bold">{expandedOfferId === offer.id ? '↑ Hide details' : '↓ View details'}</p>
                  </div>
                </div>

                {/* EXPANDED TIMELINE */}
                {expandedOfferId === offer.id && (
                  <div className="bg-gray-50 p-6 md:p-8 space-y-8 border-t border-gray-200">
                    <h3 className="text-xl font-black text-gray-900 border-b border-gray-200 pb-4">Selected Flight Details</h3>
                    {offer.slices.map((slice, i) => {
                      const firstSeg = slice.segments[0];
                      const lastSeg = slice.segments[slice.segments.length - 1];

                      const depDate = new Date(firstSeg.departing_at);
                      
                      const formatDateTime = (dateStr) => {
                         return new Date(dateStr).toLocaleString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
                      };
                      
                      const formatTime = (dateStr) => {
                         return new Date(dateStr).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                      };

                      return (
                        <div key={slice.id} className="space-y-6">
                          <h4 className="font-black text-base text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl inline-block shadow-sm">
                            {i === 0 ? '🛫 Outbound Flight' : '🛬 Inbound / Return Flight'}
                          </h4>
                          
                          {/* Macluumaadka Guud */}
                          <p className="text-gray-700 font-bold text-base px-2">
                            {depDate.toLocaleString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} • {formatTime(firstSeg.departing_at)} – {formatTime(lastSeg.arriving_at)} • {slice.duration.replace(/^PT/,'').replace(/H/,'h ').replace(/M/,'m')} • {slice.segments.length - 1 === 0 ? 'Direct flight' : `${slice.segments.length - 1} stop(s)`}
                          </p>

                          <div className="space-y-0 relative border-l-2 border-indigo-200 ml-4 pl-6 py-2">
                            {slice.segments.map((seg, segIdx) => {
                               const nextSeg = slice.segments[segIdx + 1];
                               let layover = null;
                               if (nextSeg) {
                                  const diff = new Date(nextSeg.departing_at) - new Date(seg.arriving_at);
                                  const m = Math.floor(diff / 60000);
                                  layover = `${Math.floor(m / 60) > 0 ? Math.floor(m / 60) + 'h ' : ''}${m % 60}m`;
                               }
                               
                               const bagsCount = seg.passengers?.[0]?.baggages?.filter(b=>b.type==='checked')?.length || 0;
                               const carryOnCount = seg.passengers?.[0]?.baggages?.filter(b=>b.type==='carry_on')?.length || 1;

                               return (
                                 <React.Fragment key={seg.id}>
                                   {/* Departure */}
                                   <div className="relative mb-4">
                                     <div className="absolute -left-[31px] top-1 w-3 h-3 bg-indigo-600 rounded-full ring-4 ring-white"></div>
                                     <p className="font-black text-gray-900 text-lg">
                                       {formatDateTime(seg.departing_at)} Depart from {seg.origin.name} ({seg.origin.iata_code})
                                     </p>
                                   </div>

                                   {/* Segment Details */}
                                   <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-4 mx-0 flex flex-col md:flex-row md:items-center gap-5">
                                      {(seg.operating_carrier?.logo_symbol_url || offer?.owner?.logo_symbol_url) ? (
                                         <img src={seg.operating_carrier?.logo_symbol_url || offer?.owner?.logo_symbol_url} alt="Airline" className="w-16 h-16 rounded-xl object-contain bg-white border border-gray-50 mx-auto md:mx-0 p-1.5 shadow-sm" />
                                      ) : (
                                         <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shadow-sm">✈️</div>
                                      )}
                                      <div className="flex-1 space-y-2 text-center md:text-left">
                                        <p className="text-sm font-bold text-gray-800">
                                          Flight duration: <span className="text-gray-500">{seg.duration.replace(/^PT/,'').replace(/H/,'h ').replace(/M/,'m')}</span> | {slice.fare_brand_name || seg.passengers?.[0]?.cabin_class || 'Economy'} | {seg.operating_carrier?.name || 'Airline'} | {seg.aircraft?.name || 'Aircraft unconfirmed'} | {seg.operating_carrier_flight_number}
                                        </p>
                                        <p className="text-sm font-black text-indigo-600">
                                          👜 {carryOnCount} carry-on bag iyo {bagsCount} checked bag{bagsCount > 1 ? 's' : ''}
                                        </p>
                                      </div>
                                   </div>

                                   {/* Arrival */}
                                   <div className="relative mb-2">
                                     <div className="absolute -left-[31px] top-1 w-3 h-3 bg-indigo-600 rounded-full ring-4 ring-white"></div>
                                     <p className="font-black text-gray-900 text-lg">
                                       {formatDateTime(seg.arriving_at)} Arrive at {seg.destination.name} ({seg.destination.iata_code})
                                     </p>
                                   </div>

                                   {/* Layover block */}
                                   {layover && (
                                     <div className="relative my-6 text-amber-700 font-bold bg-amber-50 inline-block px-4 py-2 rounded-xl text-sm border border-amber-100 ml-4 shadow-sm">
                                       <div className="absolute -left-[45px] top-2.5 text-lg z-10 bg-white rounded-full leading-none">⏳</div>
                                       {layover} layover at {seg.destination.name} ({seg.destination.iata_code})
                                     </div>
                                   )}
                                 </React.Fragment>
                               );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
              services={selectedOffer.available_services}
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
                <h2 className="text-2xl font-black text-gray-900">Passenger & Flight Details</h2>
                <p className="text-sm text-gray-400 font-medium mt-1">Review your flight routing and enter passenger names exactly as they appear on travel documents.</p>
              </div>
              <div className="text-right hidden md:block">
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
                  {/* Passport Details row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Passport Number</label>
                      <input type="text" value={p.passport_number || ''} onChange={e => handlePassengerChange(idx, 'passport_number', e.target.value)} placeholder="Optional" className="w-full p-3 bg-gray-50 rounded-xl font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Issuing Country Code</label>
                      <input type="text" maxLength={2} value={p.passport_country || ''} onChange={e => handlePassengerChange(idx, 'passport_country', e.target.value)} placeholder="GB" className="w-full p-3 bg-gray-50 rounded-xl font-bold uppercase" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Passport Expiry</label>
                      <input type="date" value={p.passport_expiry || ''} onChange={e => handlePassengerChange(idx, 'passport_expiry', e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold" />
                    </div>
                  </div>
                  {idx === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-2xl mt-4">
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

            {/* Payment Summary Table */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
               <h3 className="font-black text-gray-900 text-lg">Payment Summary</h3>
               <table className="w-full text-sm font-semibold text-gray-700">
                  <tbody className="divide-y divide-gray-200">
                     <tr>
                        <td className="py-3">Base Fare</td>
                        <td className="py-3 text-right">{selectedOffer.total_currency} {selectedOffer.full_offer?.base_amount || selectedOffer.base_amount_original || parseFloat(selectedOffer.total_amount).toFixed(2)}</td>
                     </tr>
                     <tr>
                        <td className="py-3">Fare Taxes</td>
                        <td className="py-3 text-right">{selectedOffer.total_currency} {selectedOffer.full_offer?.tax_amount || "0.00"}</td>
                     </tr>
                     {selectedOffer.margin_applied > 0 && (
                     <tr>
                        <td className="py-3 text-amber-600">ZamGo Processing Fee</td>
                        <td className="py-3 text-right text-amber-600">{selectedOffer.total_currency} {parseFloat(selectedOffer.margin_applied).toFixed(2)}</td>
                     </tr>
                     )}
                     {ancillaryTotal?.total > 0 && (
                     <tr>
                        <td className="py-3 text-indigo-600">Selected Extras (Seats/Bags)</td>
                        <td className="py-3 text-right text-indigo-600">+{selectedOffer.total_currency} {ancillaryTotal.total}</td>
                     </tr>
                     )}
                  </tbody>
                  <tfoot>
                     <tr className="border-t-2 border-gray-900">
                        <td className="py-4 font-black text-lg text-gray-900">Total Charged</td>
                        <td className="py-4 font-black text-2xl text-indigo-600 text-right">
                          {selectedOffer.total_currency} {(parseFloat(selectedOffer.total_amount) + parseFloat(ancillaryTotal?.total || 0)).toFixed(2)}
                        </td>
                     </tr>
                  </tfoot>
               </table>
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
    </ErrorBoundary>
  );
};

export default DuffelBookingFlow;
