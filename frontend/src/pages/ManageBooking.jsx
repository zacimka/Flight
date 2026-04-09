import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { resolveApiBaseURL } from '../services/api';

const ManageBooking = () => {
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancellationQuote, setCancellationQuote] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

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
         toast.success('Xogtaadii waa la helay!');
      } else {
         toast.error('Booking-ka lama helin.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Khalad ayaa dhacday raadinta.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
     setCancelling(true);
     try {
        const baseURL = resolveApiBaseURL();
        // Public call - PNR/Last name validation was already done during retrieval
        const res = await axios.post(`${baseURL}/duffel/cancellation-quote`, {
          order_id: booking.id
        });
        
        if (res.data.success) {
          setCancellationQuote(res.data.data);
          setShowCancelModal(true);
        } else {
          toast.error('Joojinta lama oggola duulimaadkan.');
        }
     } catch (err) {
        toast.error(err.response?.data?.message || 'Cillad ayaa dhacday cancellation quote-ka.');
     } finally {
        setCancelling(false);
     }
  };

  const confirmCancellation = async () => {
     setCancelling(true);
     try {
        const baseURL = resolveApiBaseURL();
        await axios.post(`${baseURL}/duffel/cancellations/${cancellationQuote.cancellation_id}/confirm`, {});
        toast.success('Dalabkaagii waa la tirtiray!');
        setBooking(null);
        setShowCancelModal(false);
     } catch (err) {
        toast.error('Xaqiijinta joojinta way fashilantay.');
     } finally {
        setCancelling(false);
     }
  };

  const handleChangeFlight = async () => {
     try {
        const baseURL = resolveApiBaseURL();
        // Initiating change request (Backend will handle if slices are missing for search)
        // For now, redirect to search with order context is safer unless we have a specific modal
        window.location.href = `/search?change_order=${booking.id}`;
     } catch (err) {
        toast.error('Change flight is currently unavailable.');
     }
  };

  const requestInvoice = async () => {
     try {
        const baseURL = resolveApiBaseURL();
        const res = await axios.post(`${baseURL}/duffel/request-invoice`, {
          order_id: booking.id
        });
        toast.success(res.data.message || 'Invoice-ka waxaa loo diray email-kaaga.');
     } catch (err) {
        toast.error('Failed to request invoice.');
     }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return { time: 'N/A', date: 'N/A' };
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
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-gray-500 font-medium tracking-tight">Xallinta dalabka iyo xogta duulimaadka ee live-ka ah.</p>
          
          <div className="max-w-2xl mx-auto mt-10">
            <form onSubmit={handleSearch} className="bg-white p-2 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-gray-100 flex flex-col md:flex-row gap-2">
               <input
                 type="text"
                 value={pnr}
                 onChange={(e) => setPnr(e.target.value.toUpperCase())}
                 placeholder="Order Reference (PNR)"
                 className="flex-1 px-8 py-5 rounded-[2rem] bg-gray-50 border-none outline-none font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500/20 transition-all uppercase"
                 required
               />
               <input
                 type="text"
                 value={lastName}
                 onChange={(e) => setLastName(e.target.value)}
                 placeholder="Passenger Last Name"
                 className="flex-1 px-8 py-5 rounded-[2rem] bg-gray-50 border-none outline-none font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                 required
               />
               <button
                 disabled={loading}
                 className="bg-indigo-600 text-white font-black px-12 py-5 rounded-[2rem] hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-indigo-200 active:scale-95"
               >
                 {loading ? 'Searching...' : 'Find Order'}
               </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12">
        {!booking && !loading && (
           <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl">✈️</div>
              <h3 className="text-2xl font-black text-gray-300">Geli xogtaada si aad u aragto dalabka.</h3>
           </div>
        )}

        {booking && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
              {/* Order Overview Card */}
              <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-gray-50">
                    <div className="space-y-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Confirmation Number</span>
                       <h2 className="text-5xl font-black text-gray-900 tracking-tighter">{booking?.booking_reference}</h2>
                    </div>
                    <div className="flex gap-4">
                       <div className="bg-green-100 text-green-700 font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest border border-green-200 shadow-sm">
                          {booking?.status?.toUpperCase() || 'CONFIRMED'}
                       </div>
                    </div>
                 </div>

                 <div className="p-10 md:p-14">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                       {/* Passengers Section */}
                       <div className="space-y-8">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-4">Passengers</h3>
                          <div className="space-y-4">
                             {booking?.passengers?.map((p, idx) => (
                               <div key={idx} className="flex items-center gap-5 p-5 rounded-3xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300">
                                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-sm font-black text-indigo-600 border border-gray-100">
                                     {idx + 1}
                                  </div>
                                  <div>
                                     <p className="font-black text-gray-900 uppercase text-lg leading-tight">
                                        {p?.title && `${p.title}. `}{p?.given_name} {p?.family_name}
                                     </p>
                                     <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">{p?.type || 'ADULT'}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>

                       {/* Baggage Section */}
                       <div className="space-y-8">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-4">Allowances</h3>
                          <div className="grid grid-cols-2 gap-6">
                             <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-indigo-100 transition-colors">
                                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎒</span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Carry-on</p>
                                <p className="font-black text-gray-900 text-lg">1 x 7KG</p>
                             </div>
                             <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-indigo-100 transition-colors">
                                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🧳</span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Checked</p>
                                <p className="font-black text-gray-900 text-lg">2 x 23KG</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Itinerary Section */}
              <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                 <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Full Itinerary</h3>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Real-time status</span>
                 </div>
                 
                 <div className="p-10 md:p-16">
                   <div className="relative border-l-4 border-dashed border-indigo-50 ml-6 md:ml-12 pl-12 space-y-20">
                      {booking?.slices?.[0]?.segments?.map((segment, idx) => {
                         const dep = formatDateTime(segment?.departing_at);
                         const arrTime = formatDateTime(segment?.arriving_at);
                         
                         return (
                            <React.Fragment key={idx}>
                               <div className="relative group">
                                  <div className="absolute -left-[60px] top-0 w-8 h-8 bg-indigo-600 rounded-full border-4 border-white shadow-xl shadow-indigo-100 z-10 group-hover:scale-110 transition-transform" />
                                  
                                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
                                     <div className="space-y-6 flex-1 w-full">
                                        <div className="flex items-center gap-4">
                                           <div className="px-4 py-1.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gray-200">
                                              Flight {segment?.operating_carrier_flight_number}
                                           </div>
                                           <span className="font-black text-gray-400 text-sm uppercase">{segment?.operating_carrier?.name}</span>
                                        </div>
                                        
                                        <div className="flex flex-col md:flex-row justify-between gap-12">
                                           <div className="flex-1">
                                              <p className="text-5xl font-black text-gray-900 tracking-tighter mb-2">{segment?.origin?.iata_code}</p>
                                              <p className="text-sm font-bold text-gray-400 mb-4">{segment?.origin?.name}</p>
                                              <div className="inline-block p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                 <p className="text-2xl font-black text-gray-900 leading-none">{dep.time}</p>
                                                 <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">{dep.date}</p>
                                              </div>
                                           </div>
                                           
                                           <div className="hidden md:flex items-center justify-center px-10 text-indigo-100">
                                              <svg className="w-16 h-16 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                           </div>

                                           <div className="flex-1 md:text-right">
                                              <p className="text-5xl font-black text-gray-900 tracking-tighter mb-2">{segment?.destination?.iata_code}</p>
                                              <p className="text-sm font-bold text-gray-400 mb-4">{segment?.destination?.name}</p>
                                              <div className="inline-block p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left md:text-right">
                                                 <p className="text-2xl font-black text-gray-900 leading-none">{arrTime.time}</p>
                                                 <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">{arrTime.date}</p>
                                              </div>
                                           </div>
                                        </div>
                                     </div>
                                  </div>
                               </div>

                               {segment?.layover && (
                                  <div className="flex items-center gap-6 py-6 -ml-12 relative z-20">
                                     <div className="flex-1 h-[2px] bg-slate-100" />
                                     <div className="bg-amber-50 text-amber-700 px-8 py-4 rounded-[2rem] border-2 border-amber-100/50 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-4 shadow-xl shadow-amber-500/5">
                                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                                        Stay in {segment?.layover_airport?.name} — {segment?.layover}
                                     </div>
                                     <div className="flex-1 h-[2px] bg-slate-100" />
                                  </div>
                               )}
                            </React.Fragment>
                         );
                      })}
                   </div>
                 </div>

                 <div className="p-12 md:p-16 bg-gray-900 text-white flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="text-center md:text-left">
                       <p className="text-xs font-black text-white/40 uppercase tracking-[0.4em] mb-2">Grand Total Paid</p>
                       <p className="text-6xl font-black tracking-tightest">{booking?.total_currency} {booking?.total_amount}</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                       <button onClick={() => window.print()} className="flex-1 md:flex-none px-16 py-6 bg-white text-gray-900 font-black rounded-[2rem] hover:bg-gray-100 transition-all shadow-2xl active:scale-[0.98]">
                          Generate E-Ticket
                       </button>
                    </div>
                 </div>
              </div>
              
              {/* Management Actions */}
              <div className="text-center p-12 bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                 <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8">Management & Support Options</p>
                 <div className="flex flex-wrap justify-center gap-6">
                    <button 
                      onClick={handleChangeFlight}
                      className="px-10 py-4 bg-gray-50 text-gray-900 font-extrabold rounded-2xl border border-gray-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 active:scale-95 flex items-center gap-3"
                    >
                      <span className="text-xl">🔄</span> Change Flights
                    </button>
                    <button 
                      onClick={handleCancelRequest}
                      disabled={cancelling}
                      className="px-10 py-4 bg-gray-50 text-red-600 font-extrabold rounded-2xl border border-gray-100 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center gap-3"
                    >
                      <span className="text-xl">❌</span> {cancelling ? 'Checking...' : 'Cancel Order'}
                    </button>
                    <button 
                      onClick={requestInvoice}
                      className="px-10 py-4 bg-gray-50 text-gray-900 font-extrabold rounded-2xl border border-gray-100 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 active:scale-95 flex items-center gap-3"
                    >
                      <span className="text-xl">📄</span> Request Invoice
                    </button>
                 </div>
                 
                 <div className="mt-12 pt-10 border-t border-gray-50">
                    <a 
                      href={`https://wa.me/25261xxxxxxx?text=Support%20Request%20for%20Order%20${booking.booking_reference}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-4 group/support"
                    >
                       <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-2xl group-hover/support:bg-green-500 group-hover/support:text-white transition-all duration-500">💬</div>
                       <div className="text-left">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Need immediate help?</p>
                          <p className="font-black text-gray-900 uppercase tracking-tight group-hover/support:text-indigo-600 transition-colors">Chat with Live Support</p>
                       </div>
                    </a>
                 </div>
              </div>
           </div>
        )}

        {/* Cancellation Modal */}
        {showCancelModal && cancellationQuote && (
           <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-6">
              <div className="bg-white rounded-[3.5rem] max-w-xl w-full p-12 shadow-3xl animate-in zoom-in-95 duration-500 border border-gray-100">
                 <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center text-4xl mb-8 mx-auto">⚠️</div>
                 <h2 className="text-4xl font-black text-center text-gray-900 mb-4 tracking-tightest">Cancel this journey?</h2>
                 <p className="text-center text-gray-500 font-bold mb-10 leading-relaxed px-6">Xaqiiji joojinta dalabkaaga. Fadlan dib u eeg lacagta kuu soo laabanaysa ee hoos ku qoran.</p>
                 
                 <div className="bg-gray-50 rounded-[2.5rem] p-10 space-y-6 mb-12 border border-gray-100">
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 leading-none">Amount to Refund</p>
                          <p className="text-4xl font-black text-green-600 tracking-tighter leading-none">{cancellationQuote.refund_currency} {cancellationQuote.refund_amount}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 leading-none">Refund Method</p>
                          <p className="text-lg font-black text-gray-900 uppercase leading-none">{cancellationQuote.refund_to}</p>
                       </div>
                    </div>
                    {cancellationQuote.airline_credits?.length > 0 && (
                       <div className="p-6 bg-amber-50 text-amber-800 rounded-2xl text-xs font-black uppercase tracking-widest border border-amber-200/50 leading-relaxed text-center">
                          ⚠️ Shirkadda diyaaraddu waxay ku siin doontaa "Airline Credit" oo ah lacag aad mar kale isticmaali kartid.
                       </div>
                    )}
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => setShowCancelModal(false)}
                      className="flex-1 py-6 bg-gray-100 text-gray-900 font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-95 tracking-widest uppercase text-xs"
                    >
                       No, Keep Order
                    </button>
                    <button 
                      onClick={confirmCancellation}
                      disabled={cancelling}
                      className="flex-1 py-6 bg-red-600 text-white font-black rounded-2xl hover:bg-black transition-all shadow-2xl shadow-red-200 active:scale-95 disabled:opacity-50 tracking-widest uppercase text-xs"
                    >
                       {cancelling ? 'Confirming...' : 'Yes, Cancel Now'}
                    </button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ManageBooking;
