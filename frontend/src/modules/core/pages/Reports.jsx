import { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';
import { FileText, Filter, Download, AlertTriangle, Leaf, Settings2, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function Reports() {
  const [data, setData] = useState({ environmental: [], governance: [], social: [] });
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axiosClient.get('/core/departments');
        setDepartments(res.data.departments || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const query = filterDept ? `?departmentId=${filterDept}` : '';
        const res = await axiosClient.get(`/core/reports${query}`);
        setData(res.data);
      } catch (error) {
        console.error('Error fetching reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [filterDept]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ESG Master Reports</h1>
          <p className="text-sm text-slate-500">Comprehensive raw data across modules</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Settings2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              className="input pl-10 py-2 w-full text-sm bg-white"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <button className="btn-secondary whitespace-nowrap">
            <Download className="w-4 h-4 mr-2 inline" /> Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 animate-pulse">Loading report data...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Environmental Report */}
          <div className="card p-0 overflow-hidden bg-white">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-800">Environmental Logs</h3>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-semibold text-slate-700">Date</th>
                    <th className="p-3 font-semibold text-slate-700">Department</th>
                    <th className="p-3 font-semibold text-slate-700">Source</th>
                    <th className="p-3 font-semibold text-slate-700">Emissions (kgCO2e)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.environmental.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-slate-400">No data found.</td></tr>
                  ) : (
                    data.environmental.map(log => {
                      const deptName = departments.find(d => d._id === log.department_id)?.name || log.department_id || 'N/A';
                      return (
                        <tr key={log._id} className="hover:bg-slate-50">
                          <td className="p-3">{format(new Date(log.transaction_date || log.createdAt), 'MMM dd, yyyy')}</td>
                          <td className="p-3">{deptName}</td>
                          <td className="p-3">
                            <span className="badge-blue text-[10px]">{log.source_module}</span>
                          </td>
                          <td className="p-3 font-medium text-slate-700">{log.calculated_emission_kg_co2e?.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Governance Report */}
          <div className="card p-0 overflow-hidden bg-white">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-800">Compliance Issues</h3>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-semibold text-slate-700">Created</th>
                    <th className="p-3 font-semibold text-slate-700">Department</th>
                    <th className="p-3 font-semibold text-slate-700">Severity</th>
                    <th className="p-3 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.governance.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-slate-400">No issues found.</td></tr>
                  ) : (
                    data.governance.map(issue => (
                      <tr key={issue._id} className="hover:bg-slate-50">
                        <td className="p-3">{format(new Date(issue.createdAt), 'MMM dd, yyyy')}</td>
                        <td className="p-3">{issue.department?.name || 'N/A'}</td>
                        <td className="p-3">
                          <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${
                            issue.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                            issue.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                            issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {issue.severity}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${
                            issue.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {issue.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Social Report */}
          <div className="card p-0 overflow-hidden bg-white lg:col-span-2">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-bold text-slate-800">CSR Participations</h3>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-semibold text-slate-700">Date Joined</th>
                    <th className="p-3 font-semibold text-slate-700">Employee</th>
                    <th className="p-3 font-semibold text-slate-700">Activity</th>
                    <th className="p-3 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!data.social || data.social.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-slate-400">No CSR participations found.</td></tr>
                  ) : (
                    data.social.map(part => (
                      <tr key={part._id} className="hover:bg-slate-50">
                        <td className="p-3">{format(new Date(part.joinedDate || part.createdAt), 'MMM dd, yyyy')}</td>
                        <td className="p-3 font-medium text-slate-700">{part.employeeId?.name || 'Unknown'}</td>
                        <td className="p-3 truncate max-w-[200px]">{part.csrActivityId?.title || 'Unknown Activity'}</td>
                        <td className="p-3">
                          <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${
                            part.status === 'approved' ? 'bg-green-100 text-green-700' :
                            part.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {part.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
