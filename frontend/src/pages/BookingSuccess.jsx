import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBookingPDF, confirmBookingPayment } from "../services/api";

const BookingSuccess = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecoveredBooking = async () => {
      // 1. If we already have booking from React state (navigate flow), don't refetch
      if (booking) return;

      // 2. Look for Stripe redirect params (return_url flow or Refresh)
      const searchParams = new URLSearchParams(location.search);
      const paymentIntentId = searchParams.get('payment_intent');

      if (!paymentIntentId) {
         setLoading(false);
         return;
      }

      try {
         // Re-confirming acts as a safe fetch since backend finds the existing intent
         const res = await confirmBookingPayment({ paymentIntentId }, user.token);
         setBooking(res.data.data);
      } catch (err) {
         console.error('Failed to recover booking:', err);
         setError('We could not retrieve your booking details securely. Please check your email or dashboard.');
      } finally {
         setLoading(false);
      }
    };

    fetchRecoveredBooking();
  }, [location.search, booking, user.token]);

  const downloadPDF = async () => {
     try {
        const response = await getBookingPDF(booking._id, user.token);
        
        // Create blob from response data
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Create temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ticket-${booking.pnr || booking._id}.pdf`);
        document.body.appendChild(link);
        
        // Start download
        link.click();
        
        // Cleanup
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
     } catch (err) {
        console.error('PDF Download Error:', err);
        alert('Could not download PDF. Please try again later.');
     }
  };

  if (loading) return (
     <div className="min-h-screen flex items-center justify-center p-12 text-center bg-gray-50">
        <div className="animate-pulse space-y-4">
           <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto"></div>
           <h2 className="text-xl font-bold text-gray-400">Recovering your ticket securely...</h2>
        </div>
     </div>
  );

  if (error || !booking) return (
    <div className="min-h-screen flex items-center justify-center p-12 text-center bg-gray-50">
       <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-gray-100 max-w-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">{error || "No Booking Found"}</h2>
          <p className="text-gray-500 mb-8">If you just paid, please check your email for the E-Ticket or head to your dashboard directly.</p>
          <div className="flex gap-4 justify-center">
             <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl shadow hover:bg-black">Go to Dashboard</button>
             <button onClick={() => navigate('/')} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow hover:bg-blue-700">Home</button>
          </div>
       </div>
    </div>
  );

  return (
    <main className="bg-gray-50 min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Success Header Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-blue-50 p-12 text-center animate-in zoom-in duration-700">
           <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-xl shadow-green-200">
              ✔️
           </div>
           <h1 className="text-5xl font-black text-gray-900 mb-3 tracking-tighter">Payment Successful!</h1>
           <p className="text-gray-400 font-bold mb-10 tracking-widest uppercase text-xs">Your booking has been confirmed. A copy has been sent to your email.</p>
           
           <div className="inline-flex items-center gap-6 px-10 py-4 bg-gray-900 rounded-[2rem] text-white">
              <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">RECORD LOCATOR (PNR)</p>
                 <p className="text-2xl font-black text-blue-400 tracking-widest">{booking.pnr}</p>
              </div>
              <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
              <div className="hidden sm:block">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">STATUS</p>
                 <p className="text-lg font-black text-green-400 uppercase tracking-wider">{booking.status}</p>
              </div>
           </div>
        </div>

        {/* Flight & Passenger Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           
           {/* Flight Card */}
           <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-gray-900 pointer-events-none text-8xl">✈️</div>
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6">Flight Itinerary</h3>
              <div className="space-y-8">
                 <div className="space-y-1">
                    <p className="text-2xl font-black text-gray-900">{booking.airline}</p>
                    <p className="text-sm font-bold text-gray-400">{booking.flightNumber} • {booking.flightData.class}</p>
                 </div>
                 <div className="flex items-center gap-6">
                    <div>
                       <p className="text-2xl font-black text-gray-900 font-serif">{booking.airportFrom}</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{booking.departureDate ? new Date(booking.departureDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="h-px bg-gray-100 flex-grow relative">
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 text-lg">✈️</div>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black text-gray-900 font-serif">{booking.airportTo}</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{booking.arrivalDate ? new Date(booking.arrivalDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                 </div>
                 <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                    <p className="text-[10px] font-black text-gray-300 uppercase underline decoration-blue-500/30">Confirmation # {booking._id.slice(-8).toUpperCase()}</p>
                    <div className="flex -space-x-3">
                       {[...Array(booking.adults || 1)].map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[10px]">👤</div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           {/* Financial Card */}
           <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6">Payment Summary</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-gray-500">Net Fare (Base)</span>
                    <span className="text-gray-900 font-extrabold">${Number(booking.basePrice).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-gray-500">Taxes & Markups</span>
                    <span className="text-gray-900 font-extrabold">${Number(booking.markup).toFixed(2)}</span>
                 </div>
                 {booking.extras?.baggage !== "standard" && (
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="text-blue-500 uppercase italic">Additional Baggage</span>
                       <span className="text-gray-900 font-extrabold">+${(booking.extras.baggage === "extra_10kg" ? 30 : 50).toFixed(2)}</span>
                    </div>
                 )}
                 <div className="h-px bg-gray-50 my-6"></div>
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase mb-1">TOTAL AMOUNT PAID</p>
                       <p className="text-4xl font-black text-blue-600 tracking-tighter">${Number(booking.finalPrice).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-lg">
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                       <span className="text-[10px] font-black text-green-700 uppercase">Paid securely</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Passenger Manifest */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
           <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-8">Passenger Information</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {booking.passengers.map((p, idx) => (
                 <div key={idx} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
                    <div>
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 italic">{p.type}</p>
                       <p className="font-black text-gray-900">{p.firstName} {p.lastName}</p>
                       <p className="text-xs font-bold text-gray-400">PASSPORT: {p.passportNumber || "HIDDEN"}</p>
                       <p className="text-xs font-bold text-gray-400">E-TICKET: {booking.ticketNumbers[idx]}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-green-200 flex items-center justify-center text-[10px] group-hover:bg-green-500 group-hover:text-white transition">✓</div>
                 </div>
              ))}
           </div>
        </div>

        {/* Foot Actions */}
        <div className="flex flex-col sm:flex-row gap-6 pt-10">
           <button onClick={downloadPDF} className="flex-1 py-5 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-700 transition shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2">
              <span>⬇️</span> Download E-Ticket (PDF)
           </button>
           <button onClick={() => window.print()} className="flex-1 py-5 bg-gray-900 text-white font-black rounded-3xl hover:bg-black transition shadow-xl transform hover:-translate-y-1">
              Print Confirmation
           </button>
        </div>

      </div>
    </main>
  );
};

export default BookingSuccess;
