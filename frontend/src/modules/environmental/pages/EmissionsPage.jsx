// TODO (Person 1): Implement Emissions page
// - Fetch GET /api/environmental/carbon-transactions
// - Show EmissionsLineChart + transactions table
// - Log Emission modal: department + emissionFactor + quantity + source
// - POST /api/environmental/carbon-transactions (server computes calculatedEmission)

export default function EmissionsPage() {
  return (
    <div className="card p-8 text-center text-slate-500 max-w-xl mx-auto mt-10">
      <h3 className="text-lg font-bold text-slate-700 mb-2">Emissions Module</h3>
      <p className="text-sm mb-4 leading-normal text-slate-500">This module is under construction by another team member.</p>
      <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-400">
        TODO: Fetch carbon transactions & render EmissionsLineChart
      </div>
    </div>
  );
}
