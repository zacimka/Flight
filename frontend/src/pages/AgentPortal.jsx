import { useEffect, useState } from "react";
import { getAllBookingsAdmin, updateBookingStatus } from "../services/api";
import ManualBookingForm from "../components/ManualBookingForm";

const AgentPortal = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookingsAdmin(user.token);
      setBookings(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user.token]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, { status: newStatus }, user.token);
      setBookings(bookings.map(b => b._id === id ? { ...b, status: newStatus } : b));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Agent Portal</h1>
            <p className="mt-1 text-gray-500">Manage client bookings and commissions.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
             <button 
               onClick={() => setShowManualForm(!showManualForm)}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition ${showManualForm ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
             >
               {showManualForm ? '✕ Close Form' : '+ New Manual Booking'}
             </button>
             <div className="w-px h-8 bg-gray-100 hidden md:block"></div>
             <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold ml-2">
               {user.user.name[0]}
             </div>
             <div className="pr-4 hidden sm:block">
               <p className="text-sm font-bold text-gray-900">{user.user.name}</p>
               <p className="text-xs text-indigo-600 font-medium capitalize">{user.user.role} Account</p>
             </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
           <div className="flex-1 relative w-full">
              <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search by Client, ID, or Flight Number..." 
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-600/10 transition font-medium text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              {['all', 'pending', 'paid', 'cancelled', 'refunded'].map(s => (
                <button 
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition whitespace-nowrap ${
                    statusFilter === s ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {s}
                </button>
              ))}
           </div>
        </div>

        {/* Manual Form Toggle */}
        {showManualForm && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
             <ManualBookingForm user={user} onSuccess={() => { setShowManualForm(false); fetchBookings(); }} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Performance</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-black text-gray-900">{bookings.length}</p>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                </div>
                <div className="pt-4 border-t border-gray-50">
                  <p className="text-2xl font-black text-blue-600">
                    ${bookings.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.markup, 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">Net Profit</p>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="font-bold mb-2">Need Support?</h3>
                <p className="text-indigo-100 text-sm mb-4">Contact our priority line for agents.</p>
                <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm">Get Help</button>
              </div>
              <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12">🎧</div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-bold text-gray-800">Operational Log</h3>
                <span className="text-[10px] font-black text-indigo-400 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-tight">Active: {filteredBookings.length} results</span>
              </div>
              {loading ? (
                <div className="p-12 text-center text-gray-400">Loading records...</div>
              ) : filteredBookings.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="text-5xl mb-4 grayscale opacity-20">📁</div>
                  <p className="text-gray-400 font-medium">No records matching your search.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-tight">
                        <th className="px-6 py-4">Client / Flight</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredBookings.map((b) => (
                        <tr key={b._id} className="hover:bg-blue-50/30 transition">
                          <td className="px-6 py-4">
                            <div className="mb-3">
                              <p className="font-black text-gray-900 text-xs uppercase tracking-tighter">Client</p>
                              <p className="text-sm font-medium text-blue-600">{b.userId?.name || 'Manual Customer'}</p>
                              <p className="text-[10px] text-gray-400">{b.userId?.email || b._id}</p>
                            </div>
                            <div className="pt-2 border-t border-gray-50">
                               <p className="font-bold text-gray-800 text-sm">{b.airline} {b.flightNumber}</p>
                               <p className="text-xs text-gray-500 font-medium">{b.airportFrom} → {b.airportTo}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <select 
                              value={b.status}
                              onChange={(e) => handleUpdateStatus(b._id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-0 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer ${
                                b.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="font-black text-gray-900">${b.finalPrice.toFixed(2)}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AgentPortal;
