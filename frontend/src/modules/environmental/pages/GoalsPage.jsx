// TODO (Person 1): Implement Goals page
// - Fetch GET /api/environmental/goals
// - Show goal cards with progress bar (currentValue / targetValue)
// - Mark overdue if deadline < today and progress < 100
// - Create Goal modal: title, targetValue, department, deadline

export default function GoalsPage() {
  return (
    <div className="card p-8 text-center text-slate-500 max-w-xl mx-auto mt-10">
      <h3 className="text-lg font-bold text-slate-700 mb-2">Goals Module</h3>
      <p className="text-sm mb-4 leading-normal text-slate-500">This module is under construction by another team member.</p>
      <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-400">
        TODO: Show goal progress bars & Create Goal actions
      </div>
    </div>
  );
}
