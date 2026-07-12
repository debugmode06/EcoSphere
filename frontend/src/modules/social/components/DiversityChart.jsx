import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1'];

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DiversityChart({ metrics }) {
  if (!metrics) return null;

  const { genderSplit, departmentHeadcount, ageGroups, locationSplit, totalEmployees } = metrics;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Employees" value={totalEmployees} color="text-brand-600" />
        <SummaryCard label="Gender Groups" value={genderSplit?.length || 0} color="text-purple-600" />
        <SummaryCard label="Departments" value={departmentHeadcount?.length || 0} color="text-emerald-600" />
        <SummaryCard label="Locations" value={locationSplit?.length || 0} color="text-amber-600" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Pie Chart */}
        <div className="card p-5 border border-slate-200 bg-white">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Gender Distribution</h3>
          {genderSplit && genderSplit.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={genderSplit}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={45}
                  labelLine={false}
                  label={renderCustomLabel}
                  strokeWidth={2}
                  stroke="#ffffff"
                >
                  {genderSplit.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#334155', fontSize: '12px' }}
                  itemStyle={{ color: '#334155' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                  formatter={(value) => <span className="text-slate-700 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm text-center py-10">No gender data available</p>
          )}
        </div>

        {/* Department Bar Chart */}
        <div className="card p-5 border border-slate-200 bg-white">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Department Headcount</h3>
          {departmentHeadcount && departmentHeadcount.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentHeadcount} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={{ stroke: '#334155' }}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={{ stroke: '#334155' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#334155', fontSize: '12px' }}
                  itemStyle={{ color: '#334155' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {departmentHeadcount.map((_, index) => (
                    <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm text-center py-10">No department data available</p>
          )}
        </div>
      </div>

      {/* Bottom Row: Age Groups + Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Group Bar */}
        <div className="card p-5 border border-slate-200 bg-white">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Age Group Distribution</h3>
          {ageGroups && ageGroups.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ageGroups} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#334155' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#334155', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm text-center py-10">No age data available</p>
          )}
        </div>

        {/* Location Pie */}
        <div className="card p-5 border border-slate-200 bg-white">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Location Distribution</h3>
          {locationSplit && locationSplit.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={locationSplit}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={40}
                  labelLine={false}
                  label={renderCustomLabel}
                  strokeWidth={2}
                  stroke="#ffffff"
                >
                  {locationSplit.map((_, index) => (
                    <Cell key={`loc-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#334155', fontSize: '12px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => <span className="text-slate-700 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm text-center py-10">No location data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="card p-4 border border-slate-200 bg-white text-center">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}
