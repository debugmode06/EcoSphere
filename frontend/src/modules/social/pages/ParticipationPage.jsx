// TODO (Person 2): Implement Participations page
// - Fetch GET /api/social/participations
// - Table: employee, activity, proofUrl, status, pointsEarned
// - ADMIN/MANAGER: show Approve / Reject buttons
// - PATCH /api/social/participations/:id/approve

export default function ParticipationPage() {
  return (
    <div className="card p-8 text-center text-slate-500 max-w-xl mx-auto mt-10">
      <h3 className="text-lg font-bold text-slate-700 mb-2">CSR Participations</h3>
      <p className="text-sm mb-4 leading-normal text-slate-500">This module is under construction by another team member.</p>
      <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-400">
        TODO: Show CSR participation list table & approval buttons
      </div>
    </div>
  );
}
