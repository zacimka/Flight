import { useEffect, useState } from "react";
import { getBookings } from "../services/api";

const UserDashboard = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getBookings(user.token);
        setBookings(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user.token]);

  const handleDownload = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/pdf`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to download ticket');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Travel Journey</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your upcoming paths and past adventures.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 hidden sm:block">
             <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">Logged in as</span>
             <span className="text-sm font-bold text-blue-600">{user.user.email}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
             <p className="text-gray-400 font-bold animate-pulse">Syncing travel logs...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center shadow-xl border border-gray-100">
            <div className="text-7xl mb-6 grayscale opacity-20">🛫</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">The sky is waiting!</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">You haven't booked any flights yet. Start your next adventure today.</p>
            <a href="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">Find My Flight</a>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((b) => (
              <div key={b._id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col md:flex-row">
                {/* Left Side: Status & Route */}
                <div className="p-8 md:w-2/3">
                  <div className="flex items-center gap-3 mb-6">
                     <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                       b.status === 'paid' ? 'bg-green-100 text-green-700' : 
                       b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                     }`}>
                       {b.status}
                     </span>
                     <span className="text-xs font-bold text-gray-300">ID: {b._id}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-8">
                    <div className="text-left">
                       <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Origin</p>
                       <p className="text-3xl font-black text-gray-900">{b.airportFrom || 'Search...'}</p>
                    </div>
                    
                    <div className="flex-1 px-8 relative flex flex-col items-center">
                       <div className="w-full h-px border-t-2 border-dashed border-gray-100"></div>
                       <div className="mt-[-12px] bg-white px-4 text-2xl animate-pulse">✈️</div>
                    </div>
                    
                    <div className="text-right">
                       <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                       <p className="text-3xl font-black text-gray-900">{b.airportTo || 'Search...'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-50">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1 underline decoration-blue-500/30">Airline</p>
                        <p className="text-sm font-bold text-gray-800">{b.airline || 'N/A'}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1 underline decoration-blue-500/30">Flight No</p>
                        <p className="text-sm font-bold text-gray-800">{b.flightNumber || 'N/A'}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1 underline decoration-blue-500/30">Departure</p>
                        <p className="text-sm font-bold text-gray-800">{b.departureDate ? new Date(b.departureDate).toLocaleDateString() : 'TBD'}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1 underline decoration-blue-500/30">Price Paid</p>
                        <p className="text-sm font-black text-blue-600">${(b.finalPrice || 0).toFixed(2)}</p>
                     </div>
                  </div>

                  {b.passengers && b.passengers.length > 0 && (
                     <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Passenger Manifest</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {b.passengers.map((p, pIdx) => (
                              <div key={pIdx} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                 <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black uppercase">
                                    {p.type && p.type[0] ? p.type[0] : 'P'}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-gray-900">{p.firstName} {p.lastName}</p>
                                    <p className="text-[10px] font-bold text-gray-500">ID: {p.passportNumber || 'N/A'}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
                </div>
                
                {/* Right Side: Actions */}
                <div className="bg-gray-50/50 p-8 md:w-1/3 flex flex-col justify-center items-center border-l border-gray-50">
                   <div className="w-20 h-20 bg-white rounded-3xl shadow-inner flex items-center justify-center text-4xl mb-6">
                      📄
                   </div>
                   <button 
                     onClick={() => handleDownload(b._id)}
                     className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-lg hover:bg-black transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
                   >
                     <span>Download PDF</span>
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   </button>
                   <p className="text-[10px] text-gray-400 mt-4 text-center">Receipt available for official records.</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default UserDashboard;
