import { useEffect, useState, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Wind, Zap, Target, Activity, Building2, Tag,
  TrendingUp, TrendingDown, RefreshCw
} from 'lucide-react';
import {
  getDashboardSummary, getMonthlyEmissions, getDepartmentEmissions,
  getCategoryEmissions, getTopDepartments, getRecentTransactions
} from '../../../api/environmentalApi';
import { PageSpinner } from '../../../components/ui/Spinner';

const CHART_COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#2563eb', '#7c3aed', '#dc2626', '#ea580c'];
const MONTH_NAMES  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function KpiCard({ icon: Icon, label, value, unit = '', color, trend, trendLabel }) {
  return (
    <div className="card p-5 flex items-start gap-4 hover:shadow-lg transition-shadow duration-200">
      <div className={`stat-icon ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-none">
          {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value ?? '—'}
          {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
        </p>
        {trendLabel && (
          <p className={`text-xs mt-1.5 flex items-center gap-1 ${trend === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendLabel}
          </p>
        )}
      </div>
    </div>
  );
}

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  fontSize: '12px',
};

export default function EnvironmentalDashboard() {
  const [summary, setSummary]       = useState(null);
  const [monthly, setMonthly]       = useState([]);
  const [deptData, setDeptData]     = useState([]);
  const [catData, setCatData]       = useState([]);
  const [topDepts, setTopDepts]     = useState([]);
  const [recent, setRecent]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, m, d, c, t, r] = await Promise.all([
        getDashboardSummary(),
        getMonthlyEmissions(),
        getDepartmentEmissions(),
        getCategoryEmissions(),
        getTopDepartments(),
        getRecentTransactions(8),
      ]);
      setSummary(s.data.data ?? s.data);
      // monthly — normalize to { month, totalEmission }
      const raw = m.data.data ?? [];
      setMonthly(raw.map(item => ({
        ...item,
        label: MONTH_NAMES[(item._id?.month ?? item.month ?? 1) - 1] + ' ' + (item._id?.year ?? item.year ?? ''),
      })));
      setDeptData(d.data.data ?? []);
      setCatData(c.data.data ?? []);
      setTopDepts(t.data.data ?? []);
      setRecent(r.data.data ?? []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <PageSpinner />;

  const cards = [
    { icon: Wind,      label: 'Total CO₂ Emissions', value: summary?.totalCarbonEmission,  unit: 'kg', color: 'bg-gradient-to-br from-emerald-500 to-green-600' },
    { icon: Activity,  label: 'Total Transactions',   value: summary?.totalTransactions,    unit: '',   color: 'bg-gradient-to-br from-blue-500 to-blue-700' },
    { icon: Target,    label: 'Active Goals',          value: summary?.activeGoals,          unit: '',   color: 'bg-gradient-to-br from-violet-500 to-purple-700' },
    { icon: Zap,       label: 'Emission Factors',      value: summary?.activeEmissionFactors, unit: '', color: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { icon: Building2, label: 'Departments',           value: summary?.totalDepartments,     unit: '',   color: 'bg-gradient-to-br from-rose-500 to-red-600' },
    { icon: Tag,       label: 'Categories',            value: summary?.totalCategories,      unit: '',   color: 'bg-gradient-to-br from-cyan-500 to-sky-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">🌿 Environmental Dashboard</h1>
          <p className="page-subheader">Real-time carbon emission monitoring & ESG analytics</p>
        </div>
        <button onClick={fetchAll} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map(c => <KpiCard key={c.label} {...c} />)}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Line Chart */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">📈 Monthly CO₂ Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v) => [`${v.toLocaleString()} kg`, 'CO₂']} />
              <Line type="monotone" dataKey="totalEmission" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: '#16a34a', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Bar Chart */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">🏭 Emissions by Department</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v) => [`${v.toLocaleString()} kg`, 'CO₂']} />
              <Bar dataKey="totalEmission" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Pie Chart */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">🏷️ Emissions by Category</h2>
          {catData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={catData} dataKey="totalEmission" nameKey="_id" cx="50%" cy="50%" outerRadius={85} labelLine={false}
                  label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}>
                  {catData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v) => [`${v.toLocaleString()} kg`, 'CO₂']} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Departments Horizontal Bar */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">🏆 Top 5 Polluting Departments</h2>
          {topDepts.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">No data yet</div>
          ) : (
            <div className="space-y-3 mt-2">
              {topDepts.slice(0, 5).map((d, i) => {
                const max = topDepts[0]?.totalEmission || 1;
                const pct = Math.round((d.totalEmission / max) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span className="font-medium">{d._id || 'Unknown'}</span>
                      <span className="text-slate-400">{d.totalEmission?.toLocaleString()} kg</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="table-wrapper">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-700">🕐 Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Department</th>
                <th>Emission Factor</th>
                <th>Quantity</th>
                <th>CO₂ (kg)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-slate-400 py-8">No transactions found</td></tr>
              ) : recent.map((tx) => (
                <tr key={tx._id}>
                  <td className="text-slate-500 text-xs">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                  <td className="font-medium">{tx.department || '—'}</td>
                  <td className="text-slate-500 text-xs">{tx.emissionFactor?.activity_name || tx.emissionFactor || '—'}</td>
                  <td>{tx.quantity?.toLocaleString()}</td>
                  <td className="font-semibold text-emerald-700">{tx.carbonEmission?.toLocaleString()}</td>
                  <td>
                    <span className={tx.status === 'active' ? 'badge-green' : 'badge-red'}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 text-xs text-slate-400 border-t border-slate-100">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
