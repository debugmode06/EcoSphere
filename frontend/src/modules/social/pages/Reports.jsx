import React, { useState, useEffect } from 'react';
import useSocialReports from '../hooks/useSocialReports';
import axiosClient from '../../../api/axiosClient';
import {
  BarChart2, Download, FileText, FileSpreadsheet, FileDown,
  Search, TrendingUp, Users, GraduationCap, Activity
} from 'lucide-react';

export default function Reports() {
  const { report, loading, error, fetchReport, exportReport } = useSocialReports();

  // Filter states
  const [department, setDepartment] = useState('');
  const [employee, setEmployee] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Lookups
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axiosClient.get('/core/departments')
      .then((r) => setDepartments(r.data.departments || r.data || []))
      .catch(() => {});
    axiosClient.get('/auth/employees')
      .then((r) => setEmployees(r.data.employees || []))
      .catch(() => {});
    axiosClient.get('/social/categories')
      .then((r) => setCategories(r.data.categories || []))
      .catch(() => {});
  }, []);

  const filters = { department, employee, category, startDate, endDate };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReport(filters);
  };

  const handleExport = (format) => {
    exportReport(format, filters);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-header flex items-center gap-2">
          <BarChart2 className="w-8 h-8 text-brand-500" />
          Social ESG Reports
        </h1>
        <p className="page-subheader">
          Aggregate CSR activities, participations, training completion, and diversity data into a comprehensive social performance report.
        </p>
      </div>

      {/* Filter Form */}
      <form onSubmit={handleSearch} className="card p-5 border border-slate-200 bg-white space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Report Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="label text-[10px]" htmlFor="f-dept">Department</label>
            <select id="f-dept" value={department} onChange={(e) => setDepartment(e.target.value)} className="input text-xs">
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-[10px]" htmlFor="f-emp">Employee</label>
            <select id="f-emp" value={employee} onChange={(e) => setEmployee(e.target.value)} className="input text-xs">
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-[10px]" htmlFor="f-cat">Category</label>
            <select id="f-cat" value={category} onChange={(e) => setCategory(e.target.value)} className="input text-xs">
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-[10px]" htmlFor="f-start">Start Date</label>
            <input id="f-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input text-xs" />
          </div>
          <div>
            <label className="label text-[10px]" htmlFor="f-end">End Date</label>
            <input id="f-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input text-xs" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="submit" className="btn-primary flex items-center gap-2 px-4 py-2">
            <Search className="w-4 h-4" /> Generate Report
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-200 text-sm px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-16 text-slate-500">Generating report...</div>
      )}

      {/* Report Results */}
      {report && !loading && (
        <div className="space-y-6">
          {/* Score Banner */}
          <div className="card p-6 border border-slate-200 bg-gradient-to-br from-white via-white to-brand-50 backdrop-blur-md text-center">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Composite Social ESG Score</p>
            <p className="text-5xl font-extrabold gradient-text">{report.socialScore}<span className="text-lg text-slate-500 font-normal">/100</span></p>
            <p className="text-xs text-slate-500 mt-2">Based on CSR programs, approved participations, and training completion rates.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Activity className="w-5 h-5" />}
              label="CSR Activities"
              value={report.csrActivityCounts?.total || 0}
              sub={`${report.csrActivityCounts?.active || 0} active`}
              color="text-brand-600"
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Participations"
              value={report.participationCounts?.total || 0}
              sub={`${report.participationCounts?.approved || 0} approved`}
              color="text-emerald-600"
            />
            <StatCard
              icon={<GraduationCap className="w-5 h-5" />}
              label="Training Completion"
              value={`${report.trainingStats?.completionRate || 0}%`}
              sub={`${report.trainingStats?.completed || 0}/${report.trainingStats?.total || 0}`}
              color="text-purple-600"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Workforce Size"
              value={report.diversitySummary?.totalEmployees || 0}
              sub={`${report.diversitySummary?.departmentHeadcount?.length || 0} departments`}
              color="text-amber-600"
            />
          </div>

          {/* Detailed Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Participation by Status */}
            <div className="card p-5 border border-slate-200 bg-white">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Participation Breakdown</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="text-left py-2">Status</th>
                    <th className="text-right py-2">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {['approved', 'pending', 'rejected'].map((s) => (
                    <tr key={s}>
                      <td className="py-2 capitalize text-slate-700">{s}</td>
                      <td className="py-2 text-right font-semibold text-slate-800">{report.participationCounts?.[s] || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Department Headcount */}
            <div className="card p-5 border border-slate-200 bg-white">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Department Headcount</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="text-left py-2">Department</th>
                    <th className="text-right py-2">Employees</th>
                    <th className="text-right py-2">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(report.diversitySummary?.departmentHeadcount || []).map((d, i) => (
                    <tr key={i}>
                      <td className="py-2 text-slate-700">{d.name}</td>
                      <td className="py-2 text-right font-semibold text-slate-800">{d.count}</td>
                      <td className="py-2 text-right text-slate-500">{d.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="card p-5 border border-slate-200 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Export Report</h3>
              <p className="text-xs text-slate-500">Download this report for offline distribution or compliance filings.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleExport('csv')} className="btn-secondary flex items-center gap-2 px-3 py-2 text-xs">
                <FileDown className="w-4 h-4" /> CSV
              </button>
              <button onClick={() => handleExport('pdf')} className="btn-secondary flex items-center gap-2 px-3 py-2 text-xs">
                <FileText className="w-4 h-4" /> PDF
              </button>
              <button onClick={() => handleExport('excel')} className="btn-primary flex items-center gap-2 px-3 py-2 text-xs">
                <FileSpreadsheet className="w-4 h-4" /> Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!report && !loading && !error && (
        <div className="card p-16 border border-slate-200 bg-white text-center">
          <BarChart2 className="w-14 h-14 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-500 text-sm">Select filters above and click <strong>Generate Report</strong> to view social ESG performance data.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="card p-4 border border-slate-200 bg-white">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
      <p className={`text-2xl font-extrabold ${color} mt-1`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}
