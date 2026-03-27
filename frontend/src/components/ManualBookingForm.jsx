import { useState } from "react";
import axios from "axios";
import AirportAutocomplete from "./AirportAutocomplete";

const ManualBookingForm = ({ user, onSuccess }) => {
  const [form, setForm] = useState({ 
    userId: "", 
    flightId: "", 
    basePrice: 0, 
    markup: 20, 
    status: "pending",
    airportFrom: "",
    airportTo: "",
    airline: "",
    flightNumber: "",
    departureDate: "",
    arrivalDate: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/api/admin/bookings", form, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const b = res.data.booking;
      setMessage(`✅ Booking created successfully! ID: ${b._id}. Final Price: $${b.finalPrice} (Base: ${b.basePrice} + Markup: ${b.markup}). Status: ${b.status}`);
      if (onSuccess) onSuccess();
      // Reset form
      setForm({ 
        userId: "", flightId: "", basePrice: 0, markup: 20, status: "pending",
        airportFrom: "", airportTo: "", airline: "", flightNumber: "", departureDate: "", arrivalDate: ""
      });
    } catch (err) {
      console.error(err);
      setMessage("❌ Booking creation failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl">
          ✍️
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Manual Booking</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Section: Customer & System Info */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2">Client Info</h3>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">User ID</label>
            <input 
              type="text" 
              placeholder="64d1a..." 
              className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition text-sm"
              value={form.userId} 
              onChange={e => setForm({...form, userId: e.target.value})} 
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Flight Ref/ID</label>
            <input 
              type="text" 
              placeholder="FL-123" 
              className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition text-sm"
              value={form.flightId} 
              onChange={e => setForm({...form, flightId: e.target.value})} 
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</label>
            <select 
              className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition text-sm font-bold"
              value={form.status} 
              onChange={e => setForm({...form, status: e.target.value})}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Section: Route Info */}
        <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2">Route & Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
                <AirportAutocomplete 
                    label="From" 
                    placeholder="Search Origin" 
                    value={form.airportFrom} 
                    onChange={val => setForm({...form, airportFrom: val})} 
                />
                <AirportAutocomplete 
                    label="To" 
                    placeholder="Search Destination" 
                    value={form.airportTo} 
                    onChange={val => setForm({...form, airportTo: val})} 
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Departure</label>
                   <input 
                     type="datetime-local" 
                     className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition text-sm"
                     value={form.departureDate} 
                     onChange={e => setForm({...form, departureDate: e.target.value})} 
                     required
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Arrival</label>
                   <input 
                     type="datetime-local" 
                     className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition text-sm"
                     value={form.arrivalDate} 
                     onChange={e => setForm({...form, arrivalDate: e.target.value})} 
                     required
                   />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Airline</label>
                   <input 
                     type="text" 
                     placeholder="e.g. Emirates"
                     className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition text-sm"
                     value={form.airline} 
                     onChange={e => setForm({...form, airline: e.target.value})} 
                     required
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Flight Number</label>
                   <input 
                     type="text" 
                     placeholder="EK-202"
                     className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition text-sm"
                     value={form.flightNumber} 
                     onChange={e => setForm({...form, flightNumber: e.target.value})} 
                     required
                   />
                </div>
            </div>
        </div>

        {/* Section: Pricing */}
        <div className="md:col-span-3 pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div>
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Base Price ($)</label>
               <input 
                 type="number" 
                 className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition font-black text-gray-700"
                 value={form.basePrice} 
                 onChange={e => setForm({...form, basePrice: Number(e.target.value)})} 
                 required
               />
            </div>
            <div>
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Markup ($)</label>
               <input 
                 type="number" 
                 className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition font-black text-blue-600"
                 value={form.markup} 
                 onChange={e => setForm({...form, markup: Number(e.target.value)})} 
               />
            </div>
          </div>
          
          <div className="flex-1 flex gap-4 w-full">
            <div className="flex-1 bg-indigo-50 p-3 rounded-2xl border border-indigo-100/50 flex flex-col justify-center">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Total Price</span>
                <span className="text-xl font-black text-indigo-600">${(form.basePrice + (form.markup || 0)).toFixed(2)}</span>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:shadow-2xl hover:bg-indigo-700 transition transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Register Manual Booking'}
            </button>
          </div>
        </div>
      </form>
      
      {message && (
        <div className={`mt-6 p-4 rounded-xl text-center text-sm font-bold ${message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default ManualBookingForm;
