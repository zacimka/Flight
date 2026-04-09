import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { resolveApiBaseURL } from '../services/api';

const ManageBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancellationQuote, setCancellationQuote] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Reusable function to fetch order details
  const fetchOrderDetails = useCallback(async (searchPnr, searchLastName) => {
    setLoading(true);
    try {
      const baseURL = resolveApiBaseURL();
      const res = await axios.get(`${baseURL}/duffel/orders/retrieve`, {
        params: { 
          pnr: (searchPnr || pnr).trim().toUpperCase(), 
          lastName: (searchLastName || lastName).trim() 
        }
      });
      
      if (res.data.success && res.data.data) {
         setBooking(res.data.data);
         return res.data.data;
      } else {
         toast.error('Booking-ka lama helin.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cillad ayaa dhacday soo qabashada xogta.');
    } finally {
      setLoading(false);
    }
  }, [pnr, lastName]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!pnr || !lastName) return toast.error('Fadlan geli PNR iyo Last Name.');
    fetchOrderDetails();
  };

  const handleCancelRequest = async () => {
     setCancelling(true);
     try {
        const baseURL = resolveApiBaseURL();
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
        toast.success('Dalabkaagii si guul leh ayaa loo tirtiray.');
        setBooking(null);
        setShowCancelModal(false);
        setTimeout(() => navigate('/'), 2000);
     } catch (err) {
        toast.error('Xaqiijinta joojinta way fashilantay.');
     } finally {
        setCancelling(false);
     }
  };

  const handleChangeFlight = async () => {
     // Redirect to search with flight change context via URL params
     navigate(`/?change_order_id=${booking.id}&pnr=${booking.booking_reference}`);
  };

  const handleConfirmOrderChange = async (changeId) => {
     setLoading(true);
     try {
        const baseURL = resolveApiBaseURL();
        const res = await axios.post(`${baseURL}/duffel/order-changes/${changeId}/confirm`, {});
        if (res.data.success) {
           toast.success('Duulimaadkaagii si guul leh ayaa loo beddelay!');
           // Refresh UI with latest data
           fetchOrderDetails();
        }
     } catch (err) {
        toast.error('Wuu fashilmay beddelka duulimaadku.');
     } finally {
        setLoading(false);
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
          <h1 className="text-4xl font-black text-gray-900 tracking-tight tracking-tightest">Flight Management</h1>
          <p className="text-gray-500 font-medium tracking-tight">Kicinta, beddelista, iyo tirtirista dalabyada live-ka ah.</p>
          
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
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl">🔎</div>
              <h3 className="text-2xl font-black text-gray-300 uppercase tracking-widest">Geli xogta dalabkaaga.</h3>
           </div>
        )}

        {booking && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
              {/* Order Overview Card */}
              <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-gray-50">
                    <div className="space-y-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{booking.status === 'cancelled' ? 'Cancelled Order' : 'Confirmation ID'}</span>
                       <h2 className={`text-5xl font-black tracking-tighter ${booking.status === 'cancelled' ? 'text-red-600' : 'text-gray-900'}`}>{booking?.booking_reference}</h2>
                    </div>
                    <div className="flex gap-4">
                       <div className={`${booking.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'} font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest border shadow-sm`}>
                          {booking?.status?.toUpperCase() || 'CONFIRMED'}
                       </div>
                    </div>
                 </div>

                 {booking.status === 'cancelled' && (
                    <div className="bg-red-50 p-8 border-b border-red-100 flex items-center gap-6">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-red-100">⚠️</div>
                       <div>
                          <p className="font-black text-red-900 uppercase tracking-tight">Order has been cancelled</p>
                          <p className="text-xs font-bold text-red-600/70 uppercase tracking-widest mt-1">Nasiib darro, dalabkan mar hore ayaa la joojiyay laguna soo celiyay lacagtii.</p>
                       </div>
                    </div>
                 )}

                 <div className="p-10 md:p-14">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                       {/* Passengers Section */}
                       <div className="space-y-8">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-4">Passengers</h3>
                          <div className="space-y-4">
                             {booking?.passengers?.map((p, idx) => (
                               <div key={idx} className="flex items-center gap-5 p-5 rounded-3xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300 group">
                                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-sm font-black text-indigo-600 border border-gray-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
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
                                <span className="text-4xl mb-3 group-hover:rotate-12 transition-transform">🎒</span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Carry-on</p>
                                <p className="font-black text-gray-900 text-lg">1 x 7KG</p>
                             </div>
                             <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-indigo-100 transition-colors">
                                <span className="text-4xl mb-3 group-hover:-rotate-12 transition-transform">🧳</span>
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
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Confirmed Journey</h3>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Updates</span>
                    </div>
                 </div>
                 
                 <div className="p-10 md:p-16">
                   <div className="relative border-l-4 border-dashed border-indigo-50 ml-6 md:ml-12 pl-12 space-y-24">
                      {booking?.slices?.[0]?.segments?.map((segment, idx) => {
                         const dep = formatDateTime(segment?.departing_at);
                         const arrTime = formatDateTime(segment?.arriving_at);
                         
                         return (
                            <React.Fragment key={idx}>
                               <div className="relative group">
                                  {/* Dot */}
                                  <div className="absolute -left-[62px] top-0 w-10 h-10 bg-indigo-600 rounded-full border-8 border-white shadow-2xl shadow-indigo-200 z-10 group-hover:scale-110 transition-transform duration-500" />
                                  
                                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12">
                                     <div className="space-y-8 flex-1 w-full">
                                        <div className="flex items-center gap-6">
                                           <div className="px-5 py-2 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-gray-300">
                                              Flight {segment?.operating_carrier_flight_number}
                                           </div>
                                           <span className="font-black text-gray-400 text-xs uppercase tracking-widest">{segment?.operating_carrier?.name}</span>
                                        </div>
                                        
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-12 bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100 hover:border-indigo-100 transition-colors duration-500">
                                           <div className="flex-1 text-center md:text-left">
                                              <p className="text-6xl font-black text-gray-900 tracking-tighter mb-2">{segment?.origin?.iata_code}</p>
                                              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">{segment?.origin?.name}</p>
                                              <div className="inline-block p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                                 <p className="text-3xl font-black text-gray-900 leading-none">{dep.time}</p>
                                                 <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-3">{dep.date}</p>
                                              </div>
                                           </div>
                                           
                                           <div className="flex flex-col items-center gap-4 text-indigo-200">
                                              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                                              <svg className="w-12 h-12 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14M12 5l7 7-7 7" /></svg>
                                              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                                           </div>

                                           <div className="flex-1 text-center md:text-right">
                                              <p className="text-6xl font-black text-gray-900 tracking-tighter mb-2">{segment?.destination?.iata_code}</p>
                                              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">{segment?.destination?.name}</p>
                                              <div className="inline-block p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                                 <p className="text-3xl font-black text-gray-900 leading-none">{arrTime.time}</p>
                                                 <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-3">{arrTime.date}</p>
                                              </div>
                                           </div>
                                        </div>
                                     </div>
                                  </div>
                               </div>

                               {segment?.layover && (
                                  <div className="flex items-center gap-8 py-8 -ml-12 relative z-20">
                                     <div className="flex-1 h-[2px] bg-slate-100" />
                                     <div className="bg-white text-indigo-600 px-10 py-5 rounded-[2.5rem] border-2 border-indigo-50 shadow-2xl shadow-indigo-100/20 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-5 hover:scale-105 transition-transform">
                                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-lg shadow-amber-200" />
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

                 <div className="p-12 md:p-20 bg-gray-900 text-white flex flex-col md:flex-row justify-between items-center gap-16 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="text-center md:text-left relative z-10">
                       <p className="text-xs font-black text-white/30 uppercase tracking-[0.5em] mb-3">Total Investment</p>
                       <p className="text-7xl font-black tracking-tightest">{booking?.total_currency} {booking?.total_amount}</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto relative z-10">
                       <button onClick={() => window.print()} className="flex-1 md:flex-none px-20 py-7 bg-white text-gray-900 font-black rounded-[2.5rem] hover:bg-black hover:text-white transition-all duration-500 shadow-3xl active:scale-[0.98] uppercase text-xs tracking-widest">
                          Export Ticket PDF
                       </button>
                    </div>
                 </div>
              </div>
              
              {/* Management Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {booking.status !== 'cancelled' && (
                    <>
                       <button 
                         onClick={handleChangeFlight}
                         className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col items-center gap-4"
                       >
                          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-blue-600 group-hover:text-white transition-all">🔄</div>
                          <div className="text-center">
                             <p className="font-black text-gray-900 uppercase tracking-tighter text-lg">Change Flights</p>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Modify Journey</p>
                          </div>
                       </button>

                       <button 
                         onClick={handleCancelRequest}
                         disabled={cancelling}
                         className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col items-center gap-4"
                       >
                          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-red-600 group-hover:text-white transition-all">❌</div>
                          <div className="text-center">
                             <p className="font-black text-gray-900 uppercase tracking-tighter text-lg">Cancel Order</p>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Request Refund</p>
                          </div>
                       </button>
                    </>
                 )}

                 <button 
                   onClick={requestInvoice}
                   className={`p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col items-center gap-4 ${booking.status === 'cancelled' ? 'md:col-span-3' : ''}`}
                 >
                    <div className="w-16 h-16 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-black group-hover:text-white transition-all">📄</div>
                    <div className="text-center">
                       <p className="font-black text-gray-900 uppercase tracking-tighter text-lg">Request Invoice</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Send to Email</p>
                    </div>
                 </button>
              </div>

              <div className="text-center p-12 bg-indigo-600 rounded-[3.5rem] shadow-2xl shadow-indigo-200 relative overflow-hidden group flex flex-col items-center">
                 <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-1000" />
                 <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.5em] mb-8">Need Professional Help?</p>
                 <a 
                    href={`https://wa.me/25261xxxxxxx?text=Support%20Request%20for%20Order%20${booking.booking_reference}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-6 group/support px-10 py-5 bg-white/10 rounded-3xl border border-white/20 hover:bg-white hover:border-white transition-all duration-500"
                 >
                    <div className="text-left">
                       <p className="text-[10px] font-black text-white/40 group-hover:text-indigo-400 uppercase tracking-widest mb-1 leading-none">WhatsApp Support</p>
                       <p className="font-black text-white group-hover:text-indigo-900 uppercase tracking-tight text-xl">Chat with Live Agent</p>
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">💬</div>
                 </a>
              </div>
           </div>
        )}

        {/* Cancellation Modal */}
        {showCancelModal && cancellationQuote && (
           <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[999] flex items-center justify-center p-6">
              <div className="bg-white rounded-[4rem] max-w-xl w-full p-16 shadow-3xl animate-in zoom-in-95 duration-500 border border-gray-100 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-3 bg-red-600" />
                 <div className="w-24 h-24 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center text-5xl mb-10 mx-auto animate-bounce-slow">⚠️</div>
                 <h2 className="text-4xl font-black text-center text-gray-900 mb-4 tracking-tightest">Confirm Cancellation</h2>
                 <p className="text-center text-gray-500 font-bold mb-12 leading-relaxed px-8">Ma hubtaa inaad tirtirto dalabkan? Tallaabadan dib looma soo celin karo.</p>
                 
                 <div className="bg-gray-50 rounded-[3rem] p-12 space-y-8 mb-14 border border-gray-100">
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 leading-none">Refund Amount</p>
                          <p className="text-5xl font-black text-green-600 tracking-tighter leading-none">{cancellationQuote.refund_currency} {cancellationQuote.refund_amount}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 leading-none">Refund Channel</p>
                          <p className="text-xl font-black text-gray-900 uppercase leading-none">{cancellationQuote.refund_to}</p>
                       </div>
                    </div>
                    {cancellationQuote.airline_credits?.length > 0 && (
                       <div className="p-8 bg-amber-100/50 text-amber-900 rounded-[2rem] text-[10px] font-black uppercase tracking-widest border border-amber-200/50 leading-loose text-center">
                          Airline Credit will be issued for this booking.
                       </div>
                    )}
                 </div>

                 <div className="flex flex-col sm:flex-row gap-6">
                    <button 
                      onClick={() => setShowCancelModal(false)}
                      className="flex-1 py-7 bg-gray-100 text-gray-900 font-black rounded-[2rem] hover:bg-gray-200 transition-all active:scale-95 tracking-widest uppercase text-xs"
                    >
                       No, Back to Saftey
                    </button>
                    <button 
                      onClick={confirmCancellation}
                      disabled={cancelling}
                      className="flex-1 py-7 bg-red-600 text-white font-black rounded-[2rem] hover:bg-black transition-all shadow-3xl shadow-red-200 active:scale-95 disabled:opacity-50 tracking-widest uppercase text-xs"
                    >
                       {cancelling ? 'Tirtiraya...' : 'Yes, Cancel Now'}
                    </button>
                 </div>
              </div>
           </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite; }
        @keyframes float {
          0%, 100% { transform: translateX(-10%); }
          50% { transform: translateX(10%); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}} />
    </div>
  );
};

export default ManageBooking;
