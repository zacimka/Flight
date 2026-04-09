import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { resolveApiBaseURL } from '../services/api';

const ManageBooking = () => {
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pnr || !lastName) return toast.error('Fadlan geli PNR iyo Last Name.');
    
    setLoading(true);
    setBooking(null);

    try {
      const baseURL = resolveApiBaseURL();
      const res = await axios.get(`${baseURL}/duffel/orders/retrieve`, {
        params: { pnr: pnr.trim().toUpperCase(), lastName: lastName.trim() }
      });
      
      if (res.data.success && res.data.data) {
         setBooking(res.data.data);
         toast.success('Booking retrieved successfully!');
      } else {
         toast.error('Booking not found.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred during retrieval.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return {
       time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
       date: d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    };
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Manage Your Order</h1>
          <p className="text-gray-500 font-medium">Retrieve your flight details and e-tickets directly from airline systems.</p>
          
          <div className="max-w-2xl mx-auto mt-10">
            <form onSubmit={handleSearch} className="bg-white p-2 rounded-3xl shadow-2xl shadow-indigo-100 border border-gray-100 flex flex-col md:flex-row gap-2">
               <input
                 type="text"
                 value={pnr}
                 onChange={(e) => setPnr(e.target.value.toUpperCase())}
                 placeholder="Order Reference (PNR)"
                 className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500/20 transition-all uppercase"
                 required
               />
               <input
                 type="text"
                 value={lastName}
                 onChange={(e) => setLastName(e.target.value)}
                 placeholder="Passenger Last Name"
                 className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                 required
               />
               <button
                 disabled={loading}
                 className="bg-indigo-600 text-white font-black px-10 py-4 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-200"
               >
                 {loading ? 'Searching...' : 'Find Order'}
               </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12">
        {!booking && !loading && (
           <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🔎</div>
              <h3 className="text-xl font-bold text-gray-400">Enter your details to view your journey.</h3>
           </div>
        )}

        {booking && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
              {/* Order Overview Card */}
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-50">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</span>
                       <h2 className="text-4xl font-black text-gray-900">{booking?.booking_reference}</h2>
                    </div>
                    <div className="flex gap-4">
                       <div className="bg-green-100 text-green-700 font-black px-6 py-2 rounded-full text-xs uppercase tracking-widest border border-green-200">
                          {booking?.status?.toUpperCase() || 'CONFIRMED'}
                       </div>
                    </div>
                 </div>

                 <div className="p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       {/* Passengers Section */}
                       <div className="space-y-6">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Passengers</h3>
                          <div className="space-y-4">
                             {booking?.passengers?.map((p, idx) => (
                               <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-50">
                                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-sm font-black text-indigo-600 border border-gray-100">
                                     {idx + 1}
                                  </div>
                                  <div>
                                     <p className="font-black text-gray-900 uppercase">
                                        {p?.title && `${p.title}. `}{p?.given_name} {p?.family_name}
                                     </p>
                                     <p className="text-xs font-bold text-gray-400 mt-1 uppercase">{p?.type || 'ADULT'}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>

                       {/* Baggage Section */}
                       <div className="space-y-6">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Baggage Allowance</h3>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="bg-slate-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                                <span className="text-2xl mb-2">🎒</span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Carry-on</p>
                                <p className="font-black text-gray-900">1 x 7KG</p>
                             </div>
                             <div className="bg-slate-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                                <span className="text-2xl mb-2">🧳</span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Checked</p>
                                <p className="font-black text-gray-900">2 x 23KG</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Itinerary Section */}
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-8 md:p-12 border-b border-gray-50 bg-gray-50/30">
                    <h3 className="text-xl font-black text-gray-900">Itinerary</h3>
                 </div>
                 
                 <div className="p-8 md:p-12">
                   {/* Vertical Timeline */}
                   <div className="relative border-l-2 border-indigo-100 ml-4 md:ml-10 pl-10 space-y-16">
                      {booking?.slices?.[0]?.segments?.map((segment, idx, arr) => {
                         const dep = formatDateTime(segment?.departing_at);
                         const arrTime = formatDateTime(segment?.arriving_at);
                         
                         return (
                            <React.Fragment key={idx}>
                               <div className="relative">
                                  {/* Dot */}
                                  <div className="absolute -left-[51px] top-0 w-5 h-5 bg-indigo-600 rounded-full border-4 border-white shadow-md shadow-indigo-100" />
                                  
                                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                     <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                           <div className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest shadow-sm">
                                              Flight {segment?.operating_carrier_flight_number}
                                           </div>
                                           <span className="font-black text-indigo-600 text-sm">{segment?.operating_carrier?.name}</span>
                                        </div>
                                        
                                        <div className="flex gap-16">
                                           <div>
                                              <p className="text-3xl font-black text-gray-900 tracking-tighter">{segment?.origin?.iata_code}</p>
                                              <p className="text-xs font-bold text-gray-400">{segment?.origin?.name}</p>
                                              <div className="mt-4">
                                                 <p className="text-2xl font-black text-gray-900">{dep.time}</p>
                                                 <p className="text-[10px] font-bold text-gray-400 uppercase">{dep.date}</p>
                                              </div>
                                           </div>
                                           <div className="flex items-center justify-center p-8 text-gray-200">
                                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                           </div>
                                           <div>
                                              <p className="text-3xl font-black text-gray-900 tracking-tighter">{segment?.destination?.iata_code}</p>
                                              <p className="text-xs font-bold text-gray-400">{segment?.destination?.name}</p>
                                              <div className="mt-4 text-right md:text-left">
                                                 <p className="text-2xl font-black text-gray-900">{arrTime.time}</p>
                                                 <p className="text-[10px] font-bold text-gray-400 uppercase">{arrTime.date}</p>
                                              </div>
                                           </div>
                                        </div>
                                     </div>
                                  </div>
                               </div>

                               {/* Layover Logic */}
                               {segment?.layover && (
                                  <div className="flex items-center gap-4 py-8 -ml-10">
                                     <div className="flex-1 h-px bg-dashed border-t-2 border-dashed border-gray-100" />
                                     <div className="bg-amber-50 text-amber-700 px-6 py-3 rounded-2xl border border-amber-100 text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-sm">
                                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                        Stay in {segment?.layover_airport?.name} — {segment?.layover}
                                     </div>
                                     <div className="flex-1 h-px bg-dashed border-t-2 border-dashed border-gray-100" />
                                  </div>
                               )}
                            </React.Fragment>
                         );
                      })}
                   </div>
                 </div>

                 <div className="p-8 md:p-12 bg-gray-900 text-white flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                       <p className="text-xs font-black text-white/50 uppercase tracking-[0.3em] mb-1">Total Amount</p>
                       <p className="text-4xl font-black tracking-tight">{booking?.total_currency} {booking?.total_amount}</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                       <button onClick={() => window.print()} className="flex-1 md:flex-none px-12 py-5 bg-white text-gray-900 font-black rounded-2xl hover:bg-gray-100 transition-all shadow-xl active:scale-[0.98]">
                          Print Official Ticket
                       </button>
                    </div>
                 </div>
              </div>
              
              <div className="text-center p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100">
                 <p className="text-indigo-900 text-xs font-black uppercase tracking-widest mb-6">Need Support Ref: {booking?.id}</p>
                 <div className="flex flex-wrap justify-center gap-4">
                    <button className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl shadow-sm hover:shadow-md transition">Change Flights</button>
                    <button className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl shadow-sm hover:shadow-md transition">Cancel Order</button>
                    <button className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl shadow-sm hover:shadow-md transition">Request Invoice</button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ManageBooking;
