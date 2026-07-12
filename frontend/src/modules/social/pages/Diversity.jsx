import React from 'react';
import useDiversity from '../hooks/useDiversity';
import DiversityChart from '../components/DiversityChart';
import { Users, RefreshCcw } from 'lucide-react';

export default function Diversity() {
  const { metrics, loading, error, refetch } = useDiversity();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <Users className="w-8 h-8 text-purple-500" />
            Diversity &amp; Inclusion Metrics
          </h1>
          <p className="page-subheader">
            Workforce demographics aggregated from Employee records — gender, department, age, and location.
          </p>
        </div>
        <button onClick={refetch} className="btn-secondary flex items-center gap-2 px-4 py-2">
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-200 text-sm px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading diversity metrics...</div>
      ) : (
        <DiversityChart metrics={metrics} />
      )}
    </div>
  );
}
