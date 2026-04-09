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
        {booking && (
          <div className="bg-white rounded-[2rem] shadow-2xl border border-indigo-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                <div>
                   <span className="text-xs font-black uppercase tracking-widest opacity-80">Booking Reference</span>
                   <h2 className="text-3xl font-black">{booking.pnr}</h2>
                </div>
                <div className="text-right">
                   <span className="text-xs font-black uppercase tracking-widest opacity-80">Status</span>
                   <div className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-black uppercase mt-1">
                      {booking.status}
                   </div>
                </div>
             </div>

             <div className="p-8 space-y-8">
                {/* Flight Info */}
                <div className="flex flex-col md:flex-row justify-between gap-8 border-b border-gray-100 pb-8">
                   <div className="space-y-4">
                      <div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Flight</span>
                         <p className="font-bold text-lg text-gray-900">{booking.airline} ({booking.flightNumber})</p>
                      </div>
                      <div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Route</span>
                         <p className="font-bold text-lg text-gray-900">{booking.airportFrom} &rarr; {booking.airportTo}</p>
                      </div>
                   </div>
                   <div className="space-y-4 md:text-right">
                      <div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Departure</span>
                         <p className="font-bold text-lg text-gray-900">{new Date(booking.departureDate).toLocaleString()}</p>
                      </div>
                      <div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Paid Amount</span>
                         <p className="font-black text-2xl text-indigo-600">£{booking.finalPrice}</p>
                      </div>
                   </div>
                </div>

                {/* Passengers */}
                <div>
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 text-center">Passenger List</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {booking.passengers.map((p, i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                           <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black">
                              {i + 1}
                           </div>
                           <div>
                              <p className="font-bold text-gray-900 text-sm uppercase">{p.firstName} {p.lastName || p.family_name}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">{p.type || 'adult'}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                   <button
                     onClick={downloadPDF}
                     className="flex-1 bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition shadow-xl"
                   >
                     Download E-Ticket (PDF)
                   </button>
                   <button
                     onClick={() => window.print()}
                     className="flex-1 bg-white text-gray-900 border-2 border-gray-100 font-black py-4 rounded-2xl hover:bg-gray-50 transition"
                   >
                     Print Details
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
