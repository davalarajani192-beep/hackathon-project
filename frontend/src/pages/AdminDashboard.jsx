import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Shield, 
  BarChart3, 
  Utensils, 
  Truck, 
  ShieldCheck, 
  Clock, 
  History, 
  Search, 
  RefreshCw,
  Sparkles,
  Leaf
} from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [metricsData, logsData] = await Promise.all([
        api.getMetrics(),
        api.getAuditLogs({ limit: 60 }),
      ]);
      setMetrics(metricsData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredLogs = auditLogs.filter(log => {
    if (actionFilter && log.action !== actionFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchUser = log.user_name.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      if (!matchAction && !matchUser && !matchDetails) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 bg-[#2E86AB]/10 text-[#2E86AB] rounded-full">
              Platform Administration
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500 font-medium">Decoders Governance Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14402F] mt-1">
            Diversion Impact & Audit Trail
          </h1>
          <p className="text-xs text-gray-500">
            Real-time verification metrics, diversion charts, and immutable audit logs.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-2 transition"
        >
          <RefreshCw className="w-4 h-4 text-[#3E8E6A]" />
          <span>Sync Analytics</span>
        </button>
      </div>

      {/* Metrics Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#EDF3EF] p-6 rounded-3xl border border-[#3E8E6A]/20 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Total Listed Meals
            </span>
            <div className="w-9 h-9 rounded-xl bg-white text-[#14402F] flex items-center justify-center shadow-xs">
              <Utensils className="w-4 h-4 text-[#3E8E6A]" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#14402F] mt-3">
            {metrics?.total_listed_meals || 0}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Offered by all registered donors</p>
        </div>

        <div className="bg-[#EDF3EF] p-6 rounded-3xl border border-[#3E8E6A]/20 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Collected Meals
            </span>
            <div className="w-9 h-9 rounded-xl bg-white text-[#2E86AB] flex items-center justify-center shadow-xs">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#2E86AB] mt-3">
            {metrics?.total_collected_meals || 0}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Accepted & picked up by receivers</p>
        </div>

        <div className="bg-[#EDF3EF] p-6 rounded-3xl border border-[#3E8E6A]/20 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Verified Meals
            </span>
            <div className="w-9 h-9 rounded-xl bg-white text-[#3E8E6A] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#3E8E6A] mt-3">
            {metrics?.total_verified_meals || 0}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Double-confirmed by both parties</p>
        </div>

        <div className="bg-[#EDF3EF] p-6 rounded-3xl border border-[#3E8E6A]/20 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              CO₂ Methane Prevented
            </span>
            <div className="w-9 h-9 rounded-xl bg-white text-[#F0922B] flex items-center justify-center shadow-xs">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#F0922B] mt-3">
            {metrics?.co2_saved_kg || 0} <span className="text-sm font-bold text-gray-600">kg</span>
          </p>
          <p className="text-[11px] text-gray-500 mt-1">UNEP landfill factor ~2.5kg/kg</p>
        </div>
      </div>

      {/* Chart & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Diversion Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-soft border border-gray-100 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-black text-[#14402F]">
                Surplus Food Diversion Over Time
              </h3>
              <p className="text-xs text-gray-500">
                Daily cumulative rescued meals diverted from disposal
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-[#EDF3EF] text-[#3E8E6A] rounded-full">
              Past 7 Days
            </span>
          </div>

          {/* SVG Visual Chart */}
          <div className="pt-4">
            <div className="h-64 flex items-end justify-between gap-3 px-2 pt-6 pb-2 border-b border-gray-200">
              {metrics?.diversion_timeline?.map((point, idx) => {
                const maxVal = 700;
                const heightPercent = Math.min(100, Math.round((point.meals_diverted / maxVal) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-bold text-gray-500 group-hover:text-[#F0922B] transition">
                      {point.meals_diverted}
                    </div>
                    <div className="w-full max-w-[42px] bg-[#EDF3EF] rounded-t-xl h-full flex items-end p-0.5">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#14402F] to-[#3E8E6A] group-hover:to-[#F0922B] transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500">
                      {point.date}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-3 text-xs text-gray-400">
              <span>0 meals</span>
              <span className="text-[#3E8E6A] font-semibold">● Verified Meals Rescued</span>
              <span>700+ meals</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100 space-y-4">
          <h3 className="text-base font-black text-[#14402F] border-b border-gray-100 pb-3">
            Rescue by Food Category
          </h3>

          <div className="space-y-4 pt-1">
            {metrics?.category_distribution?.map((cat, idx) => {
              const total = metrics.total_listed_meals || 1;
              const pct = Math.round((cat.meals / total) * 100);

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#14402F]">{cat.category}</span>
                    <span className="text-gray-500">{cat.meals} meals ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-[#3E8E6A]' : idx === 1 ? 'bg-[#F0922B]' : idx === 2 ? 'bg-[#2E86AB]' : 'bg-[#14402F]'
                      }`}
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full Audit Log Table */}
      <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#3E8E6A]" />
              <h3 className="text-lg font-black text-[#14402F]">Full Audit Log Table</h3>
            </div>
            <p className="text-xs text-gray-500">
              Immutable timestamped ledger of every listing, claim, collection, and verification
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:ring-[#3E8E6A]"
            >
              <option value="">All Actions</option>
              <option value="CREATED">CREATED</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="COLLECTED">COLLECTED</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Listing</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">User / Role</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Transaction Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map(log => {
                const actionBadgeClass =
                  log.action === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : log.action === 'COLLECTED'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : log.action === 'ACCEPTED'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : log.action === 'EXPIRED'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200';

                return (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3 px-3 font-mono font-bold text-[#14402F]">
                      {log.listing_id ? `#${log.listing_id}` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${actionBadgeClass}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <strong className="text-gray-900 block">{log.user_name}</strong>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{log.user_role}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="py-3 px-3 text-gray-700 max-w-md">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
