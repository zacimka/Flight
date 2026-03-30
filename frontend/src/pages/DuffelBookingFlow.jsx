import React, { useState } from 'react';
import { duffelSearchFlights, getDuffelOffer, createDuffelBooking } from '../services/api';
import { useNavigate } from 'react-router-dom';

const DuffelBookingFlow = ({ user }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('SEARCH'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search State
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departure_date: '',
    return_date: '',
    adults: 1,
    children: 0,
    cabin_class: 'economy'
  });

  // Offers State
  const [offers, setOffers] = useState([]);
  const [requestMeta, setRequestMeta] = useState(null); // holds offer_request_id and passenger types mapped from API
  
  // Selected Offer State
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState([]);

  const handleSearchChange = (e) => {
    setSearchParams(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengerDetails];
    updated[index][field] = value;
    setPassengerDetails(updated);
  };

  // Step 1: Execute Flight Search
  const fetchOffers = async (e) => {
    e.preventDefault();
    if (!searchParams.origin || !searchParams.destination || !searchParams.departure_date) {
      return setError('Origin, destination, and departure date are strictly required.');
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await duffelSearchFlights(searchParams);
      const data = res.data.data;
      
      setOffers(data.offers || []);
      setRequestMeta({
        offer_request_id: data.offer_request_id,
        passengers: data.passengers // This specifically contains the Duffel IDs { id, type } we NEED to map!
      });
      
      setStep('SELECT_OFFER');
    } catch (err) {
      setError(err.response?.data?.details || err.message || 'Failed to search Duffel flights');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Select Offer & Refresh Pricing
  const confirmOfferSelection = async (offer_id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDuffelOffer(offer_id);
      const refreshedOffer = res.data.data;
      setSelectedOffer(refreshedOffer);

      // Pre-build passenger detailing array based on Duffel's internal passenger IDs
      const mappedForm = refreshedOffer.passengers.map((p) => ({
        id: p.id,
        type: p.type,
        given_name: '',
        family_name: '',
        born_on: '',
        gender: 'm',
        title: p.type === 'adult' ? 'mr' : 'mstr',
        email: user?.email || '',
        phone_number: ''
      }));

      setPassengerDetails(mappedForm);
      setStep('PASSENGER_DETAILS');
    } catch (err) {
       setError(err.response?.data?.details || err.message || 'Offer retrieval or refresh failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Finalize Booking Request
  const createOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      return setError("You must be securely logged in to utilize Duffel vendor booking.");
    }
    
    setLoading(true);
    setError(null);
    try {
      const payload = {
        offer_id: selectedOffer.offer_id,
        total_amount: selectedOffer.total_amount,
        total_currency: selectedOffer.total_currency,
        passengers: passengerDetails
      };

      const res = await createDuffelBooking(payload, user.token);
      alert(`Booking Successful! Ref: ${res.data.data.booking_reference}`);
      navigate('/dashboard'); // Direct to trips portal
      
    } catch (err) {
       console.error(err);
       setError(err.response?.data?.debug || err.response?.data?.details || err.message || 'Failed to create Duffel order');
    } finally {
       setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header UI */}
        <div className="text-center">
           <h1 className="text-4xl font-black text-gray-900 mb-2">Live Duffel Booking Agent</h1>
           <p className="text-gray-500 font-medium">Direct airline inventory. Real-time pricing.</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl shadow-sm text-red-700 font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1: Search Form */}
        {step === 'SEARCH' && (
          <form onSubmit={fetchOffers} className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 animate-in fade-in transition duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Origin (IATA)</label>
                  <input required name="origin" value={searchParams.origin} onChange={handleSearchChange} placeholder="LHR" className="w-full p-4 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-bold uppercase transition" maxLength={3} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Destination (IATA)</label>
                  <input required name="destination" value={searchParams.destination} onChange={handleSearchChange} placeholder="JFK" className="w-full p-4 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-bold uppercase transition" maxLength={3} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Departure Date</label>
                  <input required type="date" name="departure_date" value={searchParams.departure_date} onChange={handleSearchChange} className="w-full p-4 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-bold transition" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Cabin Class</label>
                  <select name="cabin_class" value={searchParams.cabin_class} onChange={handleSearchChange} className="w-full p-4 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-bold transition">
                     <option value="economy">Economy</option>
                     <option value="premium_economy">Premium Econ</option>
                     <option value="business">Business</option>
                     <option value="first">First</option>
                  </select>
                </div>
             </div>
             
             <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 border-t border-gray-50 pt-8">
                <div className="flex gap-6">
                   <label className="flex items-center gap-2 font-bold text-gray-700">Adults <input type="number" min="1" max="9" name="adults" value={searchParams.adults} onChange={handleSearchChange} className="w-16 p-2 rounded-xl bg-gray-100 border-none text-center" /></label>
                   <label className="flex items-center gap-2 font-bold text-gray-700">Children <input type="number" min="0" max="9" name="children" value={searchParams.children} onChange={handleSearchChange} className="w-16 p-2 rounded-xl bg-gray-100 border-none text-center" /></label>
                </div>
                <button type="submit" disabled={loading} className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-700 hover:-translate-y-1 transform transition disabled:opacity-50">
                  {loading ? 'Searching Sky API...' : 'Search Top Offers'}
                </button>
             </div>
          </form>
        )}

        {/* STEP 2: Offers Board */}
        {step === 'SELECT_OFFER' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-gray-900">Live Carrier Offers ({offers.length})</h2>
                <button onClick={() => setStep('SEARCH')} className="text-sm font-bold text-gray-400 hover:text-indigo-600 transition">← Amend Search</button>
             </div>
             
             {offers.length === 0 ? (
               <div className="bg-white p-12 rounded-3xl text-center shadow-sm">
                 <p className="text-gray-500 font-bold mb-4">No viable offers were dynamically matched by carriers for your criteria.</p>
                 <button onClick={() => setStep('SEARCH')} className="px-6 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200">Return to Filter</button>
               </div>
             ) : (
               offers.map(offer => (
                 <div key={offer.id} className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex-1 w-full space-y-4">
                       <div className="flex gap-4 items-center">
                          <span className="font-black text-xl text-indigo-600">{offer.owner.name}</span>
                          <span className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase">Confirmed Pricing</span>
                       </div>
                       <div className="space-y-2">
                          {offer.slices.map((slice, sIdx) => (
                             <p key={sIdx} className="text-sm text-gray-700 font-bold">
                               <span className="text-gray-400 font-medium">Trip {sIdx+1}:</span> {slice.origin.name} ({slice.origin.iata_code}) ➔ {slice.destination.name} ({slice.destination.iata_code}) 
                               <span className="ml-2 text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">{slice.duration}</span>
                             </p>
                          ))}
                       </div>
                    </div>
                    <div className="text-right w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                       <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Due</p>
                       <p className="text-3xl font-black text-gray-900 mb-4">{offer.total_currency} {offer.total_amount}</p>
                       <button onClick={() => confirmOfferSelection(offer.id)} disabled={loading} className="w-full md:w-auto px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow">
                         {loading ? 'Validating...' : 'Select Flight'}
                       </button>
                    </div>
                 </div>
               ))
             )}
          </div>
        )}

        {/* STEP 3: Ensure Passengers */}
        {step === 'PASSENGER_DETAILS' && (
          <form onSubmit={createOrder} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border-t-8 border-indigo-600 animate-in slide-in-from-bottom-8 duration-700">
             <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                <div>
                   <h2 className="text-2xl font-black text-gray-900">Passenger Manifest</h2>
                   <p className="text-sm font-medium text-gray-500">Provide legal identification matching passports perfectly.</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">Selected Price</p>
                   <p className="text-2xl font-black">{selectedOffer?.total_currency} {selectedOffer?.total_amount}</p>
                </div>
             </div>

             <div className="space-y-12">
                {passengerDetails.map((p, idx) => (
                  <div key={p.id} className="space-y-6">
                     <h3 className="font-black text-indigo-600 uppercase text-xs tracking-widest flex items-center gap-2">
                       <span className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">{idx + 1}</span> 
                       {p.type} Passenger
                     </h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Title</label>
                           <select required value={p.title} onChange={(e) => handlePassengerChange(idx, 'title', e.target.value)} className="w-full p-4 bg-gray-50 border-0 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-600/20">
                             <option value="mr">Mr</option><option value="mrs">Mrs</option><option value="ms">Ms</option><option value="dr">Dr</option><option value="mstr">Master</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Given Name</label>
                           <input required type="text" value={p.given_name} onChange={(e) => handlePassengerChange(idx, 'given_name', e.target.value)} className="w-full p-4 bg-gray-50 border-0 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-600/20 placeholder-gray-300" placeholder="Legal First Name" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Family Name</label>
                           <input required type="text" value={p.family_name} onChange={(e) => handlePassengerChange(idx, 'family_name', e.target.value)} className="w-full p-4 bg-gray-50 border-0 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-600/20 placeholder-gray-300" placeholder="Legal Last Name" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Date of Birth</label>
                           <input required type="date" value={p.born_on} onChange={(e) => handlePassengerChange(idx, 'born_on', e.target.value)} className="w-full p-4 bg-gray-50 border-0 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-600/20" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Gender</label>
                           <select required value={p.gender} onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)} className="w-full p-4 bg-gray-50 border-0 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-600/20">
                             <option value="m">Male</option><option value="f">Female</option>
                           </select>
                        </div>
                     </div>
                     {/* Identity Contact fields required by Duffel */}
                     {idx === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl mt-4">
                            <div>
                               <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Lead Email</label>
                               <input required type="email" value={p.email} onChange={(e) => handlePassengerChange(idx, 'email', e.target.value)} className="w-full p-4 bg-white border border-gray-100 rounded-xl font-bold focus:ring-2 focus:ring-indigo-600/20" placeholder="main@contact.com" />
                            </div>
                            <div>
                               <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Lead Phone</label>
                               <input required type="tel" value={p.phone_number} onChange={(e) => handlePassengerChange(idx, 'phone_number', e.target.value)} className="w-full p-4 bg-white border border-gray-100 rounded-xl font-bold focus:ring-2 focus:ring-indigo-600/20" placeholder="+442080448838" />
                            </div>
                        </div>
                     )}
                  </div>
                ))}
             </div>

             <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-100 pt-8">
                <button type="button" onClick={() => setStep('SELECT_OFFER')} className="text-gray-400 font-bold hover:text-gray-900 transition">← Back to Offers</button>
                <div className="text-center md:text-right">
                   {!user && <p className="text-sm font-black text-red-500 mb-2">You must log in to finalize your booking order.</p>}
                   <button type="submit" disabled={loading || !user} className="w-full md:w-auto px-12 py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl hover:bg-indigo-700 hover:-translate-y-1 transform transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading ? 'Fulfilling Ticket Order...' : 'Confirm & Purchase Hold'}
                   </button>
                </div>
             </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default DuffelBookingFlow;
