import { useEffect, useState } from "react";
import axios from "axios";
import {
  getAllBookingsAdmin,
  getRevenue,
  setMarkup,
  refundBooking,
} from "../services/api";

const AdminDashboard = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [markup, setMarkupState] = useState({ type: "fixed", value: 20 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics");

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, statsRes] = await Promise.all([
        getAllBookingsAdmin(user.token),
        axios.get("/api/admin/stats", { headers: { Authorization: `Bearer ${user.token}` } })
      ]);
      setBookings(bookingsRes.data.data);
      setStats(statsRes.data.data);
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
                           {bookings.slice(0, 10).map((b) => (
                             <tr key={b._id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-8 py-4">
                                   <p className="text-sm font-bold text-gray-900">{b.userId?.name || 'Customer'}</p>
                                   <p className="text-[10px] text-gray-400">{b.airportFrom} → {b.airportTo}</p>
                                </td>
                                <td className="px-8 py-4 text-center">
                                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                     b.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                   }`}>
                                     {b.status}
                                   </span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                   <p className="text-sm font-black text-gray-900">${b.finalPrice.toFixed(2)}</p>
                                   <p className="text-[10px] text-blue-500 font-bold">+${b.markup.toFixed(2)}</p>
                                </td>
                                <td className="px-8 py-4 text-right">
                                   {b.status === 'paid' && (
                                     <button 
                                       onClick={() => onRefundTrigger(b._id)}
                                       className="text-[10px] font-black text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition"
                                     >
                                       Refund
                                     </button>
                                   )}
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
    </main>
  );
};

export default AdminDashboard;
