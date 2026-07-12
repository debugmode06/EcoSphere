// TODO (Person 3): Implement Policies page
// - Fetch GET /api/governance/policies
// - Policy cards with version, status badge, publishedDate
// - Acknowledge button (Published only) → POST /api/governance/policies/:id/acknowledge
// - ADMIN: Create policy modal

export default function PoliciesPage() {
  return (
    <div className="card p-8 text-center text-slate-500 max-w-xl mx-auto mt-10">
      <h3 className="text-lg font-bold text-slate-700 mb-2">Governance Policies</h3>
      <p className="text-sm mb-4 leading-normal text-slate-500">This module is under construction by another team member.</p>
      <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-400">
        TODO: Show policy cards with version, status badge, publishedDate & Acknowledge actions
      </div>
    </div>
  );
}
