import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createBooking, confirmBookingPayment } from "../services/api";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

const Booking = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const flight = location.state?.flight;
  
  const [step, setStep] = useState(1); // 1: Passengers, 2: Payment
  const [status, setStatus] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  // Passenger data state
  const [passengers, setPassengers] = useState([]);
  const [contact, setContact] = useState({ email: user?.email || '', phone: '' });
  const [extras, setExtras] = useState({
    baggage: "standard",
    seatPreference: "any",
    meal: "standard"
  });

  useEffect(() => {
    if (flight && flight.priceBreakdown) {
      const initialPassengers = [];
      const { numAdults, numChildren, numInfants } = flight.priceBreakdown;
      
      for (let i = 0; i < numAdults; i++) initialPassengers.push({ type: 'adult', firstName: '', lastName: '', gender: 'male', birthDate: '', passportNumber: '' });
      for (let i = 0; i < numChildren; i++) initialPassengers.push({ type: 'child', firstName: '', lastName: '', gender: 'male', birthDate: '', passportNumber: '' });
      for (let i = 0; i < numInfants; i++) initialPassengers.push({ type: 'infant', firstName: '', lastName: '', gender: 'male', birthDate: '', passportNumber: '' });
      
      setPassengers(initialPassengers);
    } else if (flight) {
        setPassengers([{ type: 'adult', firstName: '', lastName: '', gender: 'male', birthDate: '', passportNumber: '' }]);
    }
  }, [flight]);

  if (!flight) return (
    <div className="max-w-3xl mx-auto p-12 text-center">
      <div className="text-6xl mb-6">🏜️</div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">No Flight Selected</h2>
      <p className="text-gray-500 mb-8 font-medium">Please start a new search to select a flight.</p>
      <button onClick={() => navigate('/')} className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg">New Search</button>
    </div>
  );

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const startPaymentStep = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("Initializing secure payment session...");
    
    try {
      const payload = {
        flightData: flight,
        basePrice: flight.price || flight.basePrice,
        passengers,
        extras,
        adults: flight.priceBreakdown?.numAdults || 1,
        children: flight.priceBreakdown?.numChildren || 0,
        infants: flight.priceBreakdown?.numInfants || 0,
        contact
      };
      
      const res = await createBooking(payload, user.token);
      setClientSecret(res.data.clientSecret);
      setStep(2);
      setStatus("");
    } catch (err) {
      // Backend now returns specific details
      const msg = err.response?.data?.details || err.response?.data?.message || "Failed to initialize booking";
      setStatus(`❌ Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const onPaymentSuccess = async (paymentIntent) => {
    try {
      setStatus("🔄 Finalizing tickets...");
      const res = await confirmBookingPayment({ paymentIntentId: paymentIntent.id }, user.token);
      const booking = res.data.data;
      
      // Navigate to dedicated success page
      navigate('/booking-success', { state: { booking } });
    } catch (err) {
      setStatus("❌ Payment confirmed but ticket issuance failed. Please contact support.");
    }
  };

  return (
    <main className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
         {[
           { id: 1, label: 'Passengers' },
           { id: 2, label: 'Payment' },
           { id: 3, label: 'Confirmation' }
         ].map(s => (
           <div key={s.id} className="flex items-center gap-4 shrink-0">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all ${step >= s.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-300'}`}>
                {s.id}
             </div>
             <span className={`font-bold text-sm ${step >= s.id ? 'text-gray-900' : 'text-gray-300'}`}>{s.label}</span>
             {s.id < 3 && <div className="w-12 h-px bg-gray-100 mx-2"></div>}
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-8">
           {step === 1 && (
             <form onSubmit={startPaymentStep}>
                <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 sm:p-10">
                   <h2 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-6">Passenger Details</h2>
                   <div className="space-y-12">
                      {passengers.map((p, idx) => (
                         <div key={idx} className="space-y-6">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-[10px] font-black uppercase">
                                  {p.type[0]}
                               </div>
                               <h3 className="font-black text-gray-900 capitalize">{p.type} {idx + 1}</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                               <div>
                                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">First Name</label>
                                  <input required value={p.firstName} onChange={(e) => handlePassengerChange(idx, 'firstName', e.target.value)} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-0 focus:ring-4 focus:ring-blue-600/10 font-bold" />
                               </div>
                               <div>
                                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Last Name</label>
                                  <input required value={p.lastName} onChange={(e) => handlePassengerChange(idx, 'lastName', e.target.value)} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-0 focus:ring-4 focus:ring-blue-600/10 font-bold" />
                               </div>
                               <div>
                                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Gender</label>
                                  <select value={p.gender} onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-0 focus:ring-4 focus:ring-blue-600/10 font-bold">
                                     <option value="male">Male</option>
                                     <option value="female">Female</option>
                                     <option value="other">Other</option>
                                  </select>
                               </div>
                               <div>
                                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Date of Birth</label>
                                  <input required type="date" value={p.birthDate} onChange={(e) => handlePassengerChange(idx, 'birthDate', e.target.value)} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-0 focus:ring-4 focus:ring-blue-600/10 font-bold" />
                               </div>
                               <div className="sm:col-span-2">
                                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Passport / ID Number</label>
                                  <input required value={p.passportNumber} onChange={(e) => handlePassengerChange(idx, 'passportNumber', e.target.value)} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-0 focus:ring-4 focus:ring-blue-600/10 font-bold" />
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </section>

                <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 sm:p-10 mt-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-6">Primary Contact Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                       <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Email Address</label>
                          <input required type="email" value={contact.email} onChange={(e) => setContact({...contact, email: e.target.value})} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-0 focus:ring-4 focus:ring-blue-600/10 font-bold" placeholder="your@email.com" />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Phone Number</label>
                          <input required type="tel" value={contact.phone} onChange={(e) => setContact({...contact, phone: e.target.value})} pattern="[+0-9\s-]+" title="Valid phone number formatting required" className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-0 focus:ring-4 focus:ring-blue-600/10 font-bold" placeholder="+1 (555) 000-0000" />
                       </div>
                    </div>
                </section>

                <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 sm:p-10 mt-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-6">Ancillary Services (Optional)</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                       <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Additional Baggage</label>
                          <select value={extras.baggage} onChange={(e) => setExtras({...extras, baggage: e.target.value})} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-0 font-bold">
                             <option value="standard">Standard (Included)</option>
                             <option value="extra_10kg">Extra 10kg (+$30)</option>
                             <option value="extra_20kg">Extra 20kg (+$50)</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Meal Preference</label>
                          <select value={extras.meal} onChange={(e) => setExtras({...extras, meal: e.target.value})} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-0 font-bold">
                             <option value="standard">Standard Meal</option>
                             <option value="vegetarian">Vegetarian</option>
                             <option value="vegan">Vegan</option>
                             <option value="halal">Halal</option>
                          </select>
                       </div>
                    </div>
                </section>

                <div className="mt-10 flex justify-end">
                   <button type="submit" disabled={loading} className="w-full sm:w-auto px-16 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:bg-blue-700 transition transform hover:-translate-y-1">
                      {loading ? 'Initializing Booking...' : 'Review & Proceed to Payment →'}
                   </button>
                </div>
             </form>
           )}

           {step === 2 && (
             <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-blue-50 animate-in slide-in-from-bottom-4">
                <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                   <span className="text-blue-600">🛡️</span> Secure Checkout
                </h2>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm 
                    clientSecret={clientSecret} 
                    amount={Math.round((flight.finalPrice || flight.basePrice || flight.price || 0) * 100)}
                    onPaymentSuccess={onPaymentSuccess}
                    onPaymentError={(msg) => setStatus(`❌ Error: ${msg}`)}
                  />
                </Elements>
                <button 
                  onClick={() => setStep(1)} 
                  className="mt-8 text-sm font-bold text-gray-400 hover:text-gray-600 transition"
                >
                  ← Back to passenger details
                </button>
             </div>
           )}
        </div>

        {/* Sidebar Summary */}
        <aside className="space-y-6">
           <div className="bg-gray-900 p-8 rounded-[2rem] text-white shadow-xl">
              <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-6">Flight Overview</h3>
              <div className="space-y-6">
                 <div>
                    <p className="text-xl font-black">{flight.airline}</p>
                    <p className="text-xs font-bold text-blue-400">{flight.flightNumber}</p>
                 </div>
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-2xl font-black">{flight.departureTime}</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">{flight.origin}</p>
                    </div>
                    <div className="pb-1 text-gray-700">✈️</div>
                    <div className="text-right">
                       <p className="text-2xl font-black">{flight.arrivalTime}</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">{flight.destination}</p>
                    </div>
                 </div>
                 <div className="pt-6 border-t border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="text-gray-400">Selected Class</span>
                       <span className="capitalize">{flight.class}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="text-gray-400">Travelers</span>
                       <span>{(flight.priceBreakdown?.numAdults || 1) + (flight.priceBreakdown?.numChildren || 0) + (flight.priceBreakdown?.numInfants || 0)} Total</span>
                    </div>
                 </div>
                 <div className="pt-6 border-t border-white/10 space-y-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Investment</p>
                    <p className="text-5xl font-black text-blue-400 tracking-tighter">${(flight.finalPrice || flight.basePrice || flight.price || 0).toFixed(2)}</p>
                 </div>
              </div>
           </div>
           
           {status && (
              <div className={`p-6 rounded-2xl animate-shake font-bold text-sm ${status.startsWith('❌') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700'}`}>
                 {status}
              </div>
           )}
        </aside>
      </div>
    </main>
  );
};

export default Booking;
