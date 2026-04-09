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
    setLoading(true);
    setBooking(null);

    try {
      const baseURL = resolveApiBaseURL();
      // Use the new LIVE Duffel retrieval endpoint
      const res = await axios.get(`${baseURL}/duffel/orders/retrieve`, {
        params: { pnr: pnr.trim(), lastName: lastName.trim() }
      });
      setBooking(res.data.data);
      toast.success('Duffel API: Booking details retrieved!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking not found or Last Name mismatch.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }) + ' - ' + 
           d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2 mt-12">Manage Your Booking</h1>
          <p className="text-gray-500 font-medium tracking-tight">Direct airline system retrieval via Duffel API</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 mb-12">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Booking Reference (PNR)</label>
              <input
                type="text"
                value={pnr}
                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold uppercase transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Passenger Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Doe"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold transition-all"
                required
              />
            </div>
            <button
              disabled={loading}
              className="bg-indigo-600 text-white font-black py-4 px-8 rounded-2xl hover:bg-black transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 h-[60px] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching...
                </span>
              ) : 'Retrieve Booking'}
            </button>
          </form>
        </div>

        {/* Results Timeline */}
        {booking && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
             {/* Header */}
             <div className="bg-white rounded-[2.5rem] shadow-2xl border border-indigo-50 overflow-hidden">
                <div className="bg-gray-900 p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <div className="flex gap-6 items-center">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center text-3xl">✈️</div>
                      <div>
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-1">Confirmation Number</span>
                         <h2 className="text-4xl font-black">{booking.booking_reference}</h2>
                      </div>
                   </div>
                   <div className="flex flex-wrap gap-4">
                      <div className="bg-green-500/20 border border-green-500/30 px-6 py-2 rounded-2xl text-green-400 font-black text-sm uppercase tracking-tighter shadow-lg shadow-green-500/10">
                         {booking.status.toUpperCase()}
                      </div>
                   </div>
                </div>

                <div className="p-8 md:p-12 space-y-12">
                   {/* Timeline View */}
                   <div className="space-y-12 border-l-4 border-dashed border-gray-100 ml-4 md:ml-8 pl-8 md:pl-12 relative">
                      {booking.slices.map((slice, sIdx) => (
                        <div key={sIdx} className="space-y-12 pb-8">
                           {slice.segments.map((segment, segIdx) => (
                             <div key={segIdx} className="relative group">
                                {/* Dot on timeline */}
                                <div className="absolute -left-[54px] md:-left-[70px] top-0 w-8 h-8 bg-indigo-600 border-4 border-white rounded-full shadow-lg z-10" />
                                
                                <div className="flex flex-col lg:flex-row justify-between gap-8 group-hover:translate-x-1 transition-transform">
                                   <div className="flex-1">
                                      <div className="flex items-center gap-4 mb-4">
                                         <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black uppercase tracking-widest">Segment {segIdx + 1}</span>
                                         <span className="font-black text-gray-900">{segment.operating_carrier.name} — {segment.operating_carrier_flight_number}</span>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                                         <div>
                                            <p className="text-4xl font-black text-gray-900 tracking-tighter">{segment.origin.iata_code}</p>
                                            <p className="text-sm font-bold text-gray-500">{segment.origin.name}</p>
                                            <p className="mt-2 font-black text-indigo-600">{formatDate(segment.departing_at)}</p>
                                            {segment.origin_terminal && <p className="text-[10px] font-black text-amber-600 uppercase mt-1">Terminal {segment.origin_terminal}</p>}
                                         </div>
                                         <div className="md:text-right">
                                            <p className="text-4xl font-black text-gray-900 tracking-tighter">{segment.destination.iata_code}</p>
                                            <p className="text-sm font-bold text-gray-500">{segment.destination.name}</p>
                                            <p className="mt-2 font-black text-indigo-600">{formatDate(segment.arriving_at)}</p>
                                            {segment.destination_terminal && <p className="text-[10px] font-black text-amber-600 uppercase mt-1">Terminal {segment.destination_terminal}</p>}
                                         </div>
                                      </div>
                                   </div>
                                </div>

                                {/* Layover calculation display */}
                                {segment.layover && (
                                   <div className="mt-12 -ml-12 md:-ml-20 flex items-center justify-center">
                                      <div className="relative w-full border-t border-gray-100 flex justify-center">
                                         <div className="absolute -top-4 bg-white px-6 py-1.5 rounded-full border border-amber-100 shadow-md flex items-center gap-3">
                                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                            <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest">
                                               Layover in {segment.layover_airport.name} ({segment.layover_airport.iata_code}) — {segment.layover}
                                            </p>
                                         </div>
                                      </div>
                                   </div>
                                )}
                             </div>
                           ))}
                        </div>
                      ))}
                   </div>

                   {/* Footer Info */}
                   <div className="pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Passenger Manifest</h4>
                         <div className="space-y-3">
                            {booking.passengers.map((p, i) => (
                               <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-indigo-600 border border-gray-100">{i+1}</div>
                                  <p className="font-black text-gray-900 uppercase">{p.given_name} {p.family_name}</p>
                               </div>
                            ))}
                         </div>
                      </div>
                      <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col justify-center items-center text-center shadow-xl shadow-indigo-200">
                         <p className="text-white/70 font-black uppercase text-xs tracking-widest mb-2">Total Amount Paid</p>
                         <p className="text-5xl font-black tracking-tighter mb-6">{booking.total_currency} {parseFloat(booking.total_amount).toFixed(2)}</p>
                         <button 
                           onClick={() => window.print()} 
                           className="w-full py-4 bg-white text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-colors shadow-lg shadow-white/10"
                         >
                            Print Trip Details
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        <div className="text-center p-6 bg-amber-50 rounded-3xl border border-amber-100 mb-20 animate-in fade-in duration-1000 delay-500">
            <p className="text-amber-800 text-xs font-bold leading-relaxed">
               <span className="font-black uppercase tracking-widest mr-2 bg-amber-200 px-2 py-0.5 rounded-md">Advisory</span> 
               Fadlan garoonka imaw ugu yaraan 3 saacadood ka hor xilliga kicitanka (Departure). Hubi in baasaboorkaagu shaqaynayo.
            </p>
         </div>
      </div>
    </div>
  );
};

export default ManageBooking;
