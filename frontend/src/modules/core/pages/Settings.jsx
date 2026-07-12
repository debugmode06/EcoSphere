// TODO (Person 4): Implement Settings page
// - Weight sliders: environmental (0.4), social (0.3), governance (0.3) — must sum to 1.0
// - Recalculate button → POST /api/core/scores/recalculate

export default function Settings() {
  return (
    <div className="card p-8 text-center text-slate-500 max-w-xl mx-auto mt-10">
      <h3 className="text-lg font-bold text-slate-700 mb-2">Platform Settings</h3>
      <p className="text-sm mb-4 leading-normal text-slate-500">This module is under construction by another team member.</p>
      <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-400">
        TODO: Show weight sliders for ESG categories & Recalculate options
      </div>
    </div>
  );
}
