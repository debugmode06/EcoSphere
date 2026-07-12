// TODO (Person 4): Implement Org Dashboard
// - Fetch GET /api/core/dashboard
// - Show orgScore hero, department E/S/G scores, ESGRadarChart, XP leaderboard
// - Stat cards: total emissions, employees, open compliance issues, pending reviews

export default function OrgDashboard() {
  return (
    <div className="card p-8 text-center text-slate-500 max-w-xl mx-auto mt-10">
      <h3 className="text-lg font-bold text-slate-700 mb-2">Organization Dashboard</h3>
      <p className="text-sm mb-4 leading-normal text-slate-500">This module is under construction by another team member.</p>
      <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-400">
        TODO: Show org ESG score, ESGRadarChart & XP rankings
      </div>
    </div>
  );
}
