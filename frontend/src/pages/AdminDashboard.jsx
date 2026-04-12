import { useEffect, useState } from "react";
import axios from "axios";
import {
  getAllBookingsAdmin,
  getRevenue,
  setMarkup,
  refundBooking,
  getAdminStats,
  updateBookingStatus
} from "../services/api";

const AdminDashboard = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [markup, setMarkupState] = useState({ type: "fixed", value: 20 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics");
  const [selectedBooking, setSelectedBooking] = useState(null); // For modal

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, statsRes] = await Promise.all([
        getAllBookingsAdmin(user.token),
        getAdminStats(user.token)
      ]);
      
      // Admin should see latest bookings
      setBookings(bookingsRes?.data?.data || []);
      setStats(statsRes?.data?.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.token]);

  const onMarkupTrigger = async (ev) => {
    ev.preventDefault();
    try {
      await setMarkup(markup, user.token);
      alert("✅ Markup settings updated globally.");
    } catch (err) {
      console.error(err);
    }
  };

  const onRefundTrigger = async (id) => {
    if (!window.confirm("Are you sure you want to refund this booking? This action is permanent.")) return;
    try {
      await refundBooking(id, user.token);
      loadData(); // Refresh all stats
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, { status: newStatus }, user.token);
      setBookings(bookings.map(b => b._id === id ? { ...b, status: newStatus } : b));
      loadData(); // Refresh analytics stats visually too
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 mb-8 pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Command Center</h1>
                <p className="text-gray-500 font-medium">Global oversight of Travelopro operations.</p>
              </div>
              <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                 <button 
                   onClick={() => setActiveTab("analytics")}
                   className={`px-6 py-2 rounded-xl text-sm font-black transition ${activeTab === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                 >
                   Analytics
                 </button>
                 <button 
                   onClick={() => setActiveTab("settings")}
                   className={`px-6 py-2 rounded-xl text-sm font-black transition ${activeTab === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                 >
                   Settings
                 </button>
                 <button 
                   onClick={loadData}
                   className="ml-2 px-4 py-2 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                   title="Refresh Data"
                 >
                   ↻ Refresh
                 </button>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-bold animate-pulse">Loading secure data...</div>
        ) : activeTab === 'analytics' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
             {/* Stats Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Gross Revenue</p>
                   <p className="text-3xl font-black text-gray-900">${stats?.totalRevenue?.toFixed(2)}</p>
                   <p className="text-xs text-green-500 font-bold mt-2">↑ {stats?.recentGrowth}% this period</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Net Profit (Markups)</p>
                   <p className="text-3xl font-black text-blue-600">${stats?.totalMarkups?.toFixed(2)}</p>
                   <p className="text-xs text-gray-400 font-bold mt-2">Efficiency: {((stats?.totalMarkups / stats?.totalRevenue)*100).toFixed(1)}%</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Active Volume</p>
                   <p className="text-3xl font-black text-gray-900">{stats?.totalBookings}</p>
                   <div className="flex gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-bold">{stats?.statusCounts?.paid || 0} Paid</span>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-bold">{stats?.statusCounts?.pending || 0} Pend</span>
                   </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Refunded Rate</p>
                   <p className="text-3xl font-black text-red-500">{((stats?.statusCounts?.refunded / stats?.totalBookings)*100 || 0).toFixed(1)}%</p>
                   <p className="text-xs text-gray-400 font-bold mt-2">{stats?.statusCounts?.refunded || 0} Total refunds</p>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Popular Routes */}
                <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                   <h3 className="text-lg font-black text-gray-900 mb-6">Top Performing Routes</h3>
                   <div className="space-y-6">
                      {stats?.topRoutes?.map((r, i) => (
                        <div key={i} className="flex justify-between items-center">
                           <div className="flex items-center gap-3">
                              <span className="w-6 h-6 bg-gray-50 text-[10px] flex items-center justify-center rounded-lg font-black text-gray-400">{i+1}</span>
                              <span className="text-sm font-bold text-gray-700">{r.route}</span>
                           </div>
                           <span className="text-xs font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">{r.count} Bookings</span>
                        </div>
                      ))}
                      {stats?.topRoutes?.length === 0 && <p className="text-sm text-gray-400 py-10 text-center">No route data yet.</p>}
                   </div>
                </div>

                {/* Recent Bookings List */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                   <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                      <h3 className="text-lg font-black text-gray-900">Recent Transactions</h3>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                           <tr>
                              <th className="px-8 py-4">Client / Path</th>
                              <th className="px-8 py-4 text-center">Status</th>
                              <th className="px-8 py-4 text-right">Revenue</th>
                              <th className="px-8 py-4"></th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                           {bookings.slice(0, 100).map((b) => (
                             <tr key={b._id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-8 py-4">
                                   <p className="text-sm font-bold text-gray-900">{b.userId?.name || b.contact?.email || `Legacy Client (${b._id.slice(-4)})`}</p>
                                   <p className="text-[10px] text-gray-400">{b.airportFrom || 'Unknown'} → {b.airportTo || 'Unknown'}</p>
                                   <p className="text-[9px] text-gray-400 italic">Booked: {new Date(b.createdAt).toLocaleDateString()}</p>
                                   {b.passengers && b.passengers.length > 0 && (
                                      <p className="text-[9px] text-blue-500 font-bold uppercase mt-1">
                                         {b.passengers.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
                                      </p>
                                   )}
                                </td>
                                <td className="px-8 py-4 text-center">
                                   <select 
                                     value={b.status}
                                     onChange={(e) => handleUpdateStatus(b._id, e.target.value)}
                                     className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-0 focus:ring-0 cursor-pointer ${
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
                                <td className="px-8 py-4 text-right">
                                   <p className="text-sm font-black text-gray-900">${(b.finalPrice || 0).toFixed(2)}</p>
                                   <p className="text-[10px] text-blue-500 font-bold">+${(b.markup || 0).toFixed(2)}</p>
                                </td>
                                <td className="px-8 py-4 text-right">
                                   <div className="flex justify-end gap-2 text-right">
                                      <button 
                                         onClick={() => setSelectedBooking(b)}
                                         className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition border border-blue-100"
                                      >
                                         Details
                                      </button>
                                      {b.status === 'paid' && (
                                        <button 
                                          onClick={() => onRefundTrigger(b._id)}
                                          className="text-[10px] font-black text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition"
                                        >
                                          Refund
                                        </button>
                                      )}
                                   </div>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="max-w-xl bg-white p-12 rounded-3xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 mb-2">Global Pricing Strategy</h3>
                <p className="text-gray-500 mb-8 font-medium">Define your automated markup calculation rules.</p>
                
                <form onSubmit={onMarkupTrigger} className="space-y-6">
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Calculation Model</label>
                      <select 
                        className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-600/20 transition font-bold text-gray-800 appearance-none"
                        value={markup.type}
                        onChange={(e) => setMarkupState({ ...markup, type: e.target.value })}
                      >
                        <option value="fixed">Fixed Flat Fee ($)</option>
                        <option value="percentage">Percentage Markup (%)</option>
                      </select>
                   </div>
                   
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rule Value</label>
                      <input 
                        className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-600/20 transition font-black text-2xl text-blue-600"
                        type="number"
                        value={markup.value}
                        onChange={(e) => setMarkupState({ ...markup, value: Number(e.target.value) })}
                      />
                   </div>
                   
                   <button className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1" type="submit">
                     Save Global Settings
                   </button>
                </form>
             </div>
          </div>
        )}
      </div>
      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-8 flex justify-between items-center z-10">
                 <div>
                    <h2 className="text-2xl font-black text-gray-900 leading-tight">Booking Manifest</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {selectedBooking._id} • PNR: <span className="text-blue-600">{selectedBooking.pnr || 'NOT_ISSUED'}</span></p>
                 </div>
                 <button onClick={() => setSelectedBooking(null)} className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center text-xl transition">✕</button>
              </div>

              <div className="p-8 space-y-12">
                 {/* Flight Path */}
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Flight Logistics</h4>
                       <div className="space-y-6">
                          <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                             <div>
                                <p className="text-xs text-gray-400 font-bold">DEPARTURE</p>
                                <p className="text-xl font-black text-gray-900">{selectedBooking.airportFrom}</p>
                                <p className="text-[10px] text-gray-500 font-medium">{new Date(selectedBooking.departureDate).toLocaleString()}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-xs text-gray-400 font-bold">ARRIVAL</p>
                                <p className="text-xl font-black text-gray-900">{selectedBooking.airportTo}</p>
                                <p className="text-[10px] text-gray-500 font-medium">{selectedBooking.arrivalDate ? new Date(selectedBooking.arrivalDate).toLocaleString() : 'N/A'}</p>
                             </div>
                          </div>
                          <div className="flex gap-4 items-center">
                             <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">✈️</div>
                             <div>
                                <p className="text-sm font-bold text-gray-800">{selectedBooking.airline} - {selectedBooking.flightNumber}</p>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Cabin: {selectedBooking.flightData?.cabin_class || 'Economy'}</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Financial Summary</h4>
                       <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                             <span className="text-gray-500 font-medium">Airline Net Cost:</span>
                             <span className="text-gray-900 font-bold">${(selectedBooking.basePrice || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                             <span className="text-blue-600 font-black italic">ZamGo Markup:</span>
                             <span className="text-blue-600 font-black">+${(selectedBooking.markup || 0).toFixed(2)}</span>
                          </div>
                          <div className="pt-4 border-t border-blue-100 flex justify-between items-end">
                             <span className="text-lg font-black text-gray-900">Paid by Client:</span>
                             <span className="text-2xl font-black text-blue-600">${(selectedBooking.finalPrice || 0).toFixed(2)}</span>
                          </div>
                          <div className="pt-2">
                             <p className="text-[10px] text-gray-400 font-bold italic">Payment ID: {selectedBooking.paymentId || 'N/A'}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Passengers */}
                 <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Passenger Manifest</h4>
                    <div className="grid gap-4">
                       {selectedBooking.passengers?.map((p, idx) => (
                         <div key={idx} className="p-6 bg-white border border-gray-100 rounded-3xl flex justify-between items-center group hover:border-blue-200 transition">
                            <div className="flex items-center gap-5">
                               <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition">
                                  {p.gender === 'm' ? '🧔' : '👩'}
                               </div>
                               <div>
                                  <p className="text-lg font-black text-gray-900 leading-tight">{p.firstName} {p.lastName}</p>
                                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{p.type} • DOB: {new Date(p.birthDate).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Identity</p>
                               <p className="text-sm font-bold text-gray-700">{p.passportNumber || 'No Passport On File'}</p>
                            </div>
                         </div>
                       ))}
                       {(!selectedBooking.passengers || selectedBooking.passengers.length === 0) && (
                         <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400 font-bold italic">
                            No passenger details recorded for this ledger entry.
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Contact & Support */}
                 <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                       <div>
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Customer Outreach</p>
                          <h4 className="text-2xl font-black leading-tight">Primary Contact Node</h4>
                       </div>
                       <div className="space-y-2">
                          <p className="text-lg font-bold flex items-center gap-3">
                             <span className="opacity-50">📧</span> {selectedBooking.contact?.email || selectedBooking.userId?.email || 'N/A'}
                          </p>
                          <p className="text-lg font-bold flex items-center gap-3">
                             <span className="opacity-50">📞</span> {selectedBooking.contact?.phone || 'No Phone Number'}
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
                 <button onClick={() => setSelectedBooking(null)} className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition shadow-lg">Close Details</button>
              </div>
           </div>
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;
