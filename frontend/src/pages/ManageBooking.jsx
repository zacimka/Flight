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
      const res = await axios.get(`${baseURL}/bookings/manage/${pnr}/${lastName}`);
      setBooking(res.data.data);
      toast.success('Xogtaadii waa la helay!');
    } catch (err) {
      const msg = err.response?.data?.message || 'PNR ama Last Name waa khalad.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const baseURL = resolveApiBaseURL();
      const response = await axios.get(`${baseURL}/bookings/${booking._id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ZamGo-Ticket-${booking.pnr}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      toast.error('PDF-ka lama soo degsan karo hadda.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Manage Your Booking</h1>
          <p className="text-gray-500 font-medium">View your flight details or download your e-ticket.</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">PNR Number</label>
              <input
                type="text"
                value={pnr}
                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Doe"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                required
              />
            </div>
            <button
              disabled={loading}
              className="bg-indigo-600 text-white font-black py-3 px-6 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50 h-[50px]"
            >
              {loading ? 'Searching...' : 'Retrieve Booking'}
            </button>
          </form>
        </div>

        {/* Results */}
        {/* Results */}
        {booking && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Header Card */}
             <div className="bg-white rounded-[2rem] shadow-2xl border border-indigo-100 overflow-hidden">
                <div className="bg-indigo-600 p-8 text-white">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1 block">Booking Reference</span>
                         <h2 className="text-4xl font-black">{booking.pnr}</h2>
                      </div>
                      <div className="flex gap-3">
                         <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest block">Status</span>
                            <span className="font-black text-sm uppercase">{booking.status}</span>
                         </div>
                         <div className="bg-green-400 text-green-900 px-4 py-2 rounded-2xl text-center shadow-lg shadow-green-900/20">
                            <span className="text-[10px] font-black uppercase tracking-widest block opacity-70">Payment</span>
                            <span className="font-black text-sm uppercase">CONFIRMED</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-8 space-y-10">
                   {/* Flight Segments */}
                   <div className="space-y-6">
                      <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-3">Journey Details</h3>
                      
                      {booking.flightData?.slices?.map((slice, sIdx) => (
                        <div key={sIdx} className="space-y-6">
                           {slice.segments.map((segment, segIdx) => (
                             <div key={segIdx} className="bg-slate-50 rounded-[2rem] p-6 border border-gray-100 relative">
                                <div className="flex flex-col md:flex-row justify-between gap-8">
                                   <div className="flex-1 space-y-1">
                                      <div className="flex items-center gap-3 mb-4">
                                         <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center font-black text-indigo-600 border border-gray-100 text-xs">
                                            {segment.operating_carrier.iata_code}
                                         </div>
                                         <span className="font-black text-gray-900">{segment.operating_carrier.name} — {segment.operating_carrier_flight_number}</span>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-12">
                                         <div>
                                            <p className="text-3xl font-black text-gray-900">{segment.origin.iata_code}</p>
                                            <p className="text-xs font-bold text-gray-500">{segment.origin.name}</p>
                                            <p className="text-sm font-black text-indigo-600 mt-2">{new Date(segment.departing_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            <p className="text-[10px] font-bold text-gray-400">{new Date(segment.departing_at).toDateString()}</p>
                                         </div>
                                         <div className="text-right">
                                            <p className="text-3xl font-black text-gray-900">{segment.destination.iata_code}</p>
                                            <p className="text-xs font-bold text-gray-500">{segment.destination.name}</p>
                                            <p className="text-sm font-black text-indigo-600 mt-2">{new Date(segment.arriving_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            <p className="text-[10px] font-bold text-gray-400">{new Date(segment.arriving_at).toDateString()}</p>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                                
                                {/* Connection Indicator */}
                                {segIdx < slice.segments.length - 1 && (
                                   <div className="py-4 text-center">
                                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                         <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                         Connection in {slice.segments[segIdx+1].origin.iata_code}
                                      </div>
                                   </div>
                                )}
                             </div>
                           ))}
                        </div>
                      )) || (
                        /* Fallback for non-duffel legacy bookings */
                        <div className="bg-slate-50 rounded-[2rem] p-8 border border-gray-100">
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                              <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Airline</p><p className="font-black">{booking.airline}</p></div>
                              <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Flight</p><p className="font-black">{booking.flightNumber}</p></div>
                              <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Route</p><p className="font-black">{booking.airportFrom} → {booking.airportTo}</p></div>
                              <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Departure</p><p className="font-black text-indigo-600">{new Date(booking.departureDate).toLocaleDateString()}</p></div>
                           </div>
                        </div>
                      )}
                   </div>

                   {/* Passengers & Extras */}
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="lg:col-span-2 space-y-6">
                         <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-3">Passenger List</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {booking.passengers.map((p, i) => (
                              <div key={i} className="bg-white border-2 border-gray-50 p-5 rounded-3xl flex items-center gap-4 hover:border-indigo-100 transition-colors group">
                                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    {i + 1}
                                 </div>
                                 <div>
                                    <p className="font-black text-gray-900 uppercase leading-none mb-1">{p.firstName} {p.lastName || p.family_name}</p>
                                    <div className="flex gap-2 items-center">
                                       <span className="text-[10px] font-black text-gray-400 uppercase">{p.type || 'adult'}</span>
                                       <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                       <span className="text-[10px] font-black text-indigo-500 uppercase">Confirmed</span>
                                    </div>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100/50 self-start">
                         <h3 className="text-sm font-black text-indigo-400 uppercase tracking-[0.2em] mb-6">Payment Summary</h3>
                         <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                               <span>Base Fare</span>
                               <span>£{booking.finalPrice - (booking.markup || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                               <span>Taxes & Fees</span>
                               <span>INCLUDED</span>
                            </div>
                            <div className="pt-4 border-t border-indigo-200/50 flex justify-between items-center">
                               <span className="font-black text-gray-900">Total Paid</span>
                               <span className="text-2xl font-black text-indigo-600">£{booking.finalPrice}</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Master Actions */}
                   <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <button
                        onClick={downloadPDF}
                        className="flex-1 bg-gray-900 text-white font-black py-5 rounded-[1.5rem] hover:bg-black transition-all shadow-2xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-[0.98]"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Download Official E-Ticket
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-10 bg-white text-gray-900 border-2 border-gray-100 font-black py-5 rounded-[1.5rem] hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4" /></svg>
                        Print Details
                      </button>
                   </div>
                </div>
             </div>
             
             <div className="text-center p-6 bg-amber-50 rounded-3xl border border-amber-100">
                <p className="text-amber-800 text-xs font-bold">
                   <span className="font-black uppercase tracking-widest mr-2">Advisory:</span> 
                   Please arrive at the airport at least 3 hours before departure for international flights. Valid Passport is required.
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBooking;
