import React from 'react';
import { Calendar, Users, GraduationCap, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';

export default function TrainingTable({
  trainings,
  history,
  role,
  onAssign,
  onEdit,
  onDelete,
  onComplete,
  loading,
}) {
  const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';
  
  // Create a map of user's completion status per training ID
  const completionMap = new Map();
  history.forEach((h) => {
    const tId = h.trainingId?._id || h.trainingId;
    completionMap.set(tId, {
      status: h.status,
      date: h.completionDate,
    });
  });

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading training programs...</div>;
  }

  if (trainings.length === 0) {
    return (
      <div className="card p-10 text-center text-slate-500">
        <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-500" />
        No training programs found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
            <th className="px-5 py-4">Title &amp; Description</th>
            <th className="px-5 py-4">Department</th>
            <th className="px-5 py-4">Duration</th>
            {isAdminOrManager ? (
              <>
                <th className="px-5 py-4">Participants / Progress</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </>
            ) : (
              <>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm">
          {trainings.map((t) => {
            const completion = completionMap.get(t._id);
            const userIsAssigned = !!completion;
            const userHasCompleted = completion?.status === 'completed';

            // Completion stats (computed backend-side)
            const rate = Math.round(t.completionRate || 0);
            const totalAssigned = t.totalAssigned || 0;
            const totalCompleted = t.totalCompleted || 0;

            return (
              <tr key={t._id} className="hover:bg-slate-50 transition-all duration-150 group">
                <td className="px-5 py-4 max-w-sm">
                  <p className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {t.departmentInfo?.name || t.department?.name || 'All'}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-slate-700 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    <span>
                      {new Date(t.startDate).toLocaleDateString()} -{' '}
                      {new Date(t.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                {isAdminOrManager ? (
                  <>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-slate-700 text-xs shrink-0">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {totalCompleted}/{totalAssigned}
                          </span>
                        </div>
                        <div className="w-24 bg-slate-200 rounded-full h-1.5 shrink-0 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-brand-500 to-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">{rate}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onAssign(t)}
                          className="btn-primary text-xs px-2.5 py-1 flex items-center gap-1"
                        >
                          <Users className="w-3 h-3" /> Assign
                        </button>
                        <button
                          onClick={() => onEdit(t)}
                          className="btn-secondary text-xs p-1"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(t._id)}
                          className="btn-danger text-xs p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {userHasCompleted ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full font-semibold">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                          Not Completed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!userHasCompleted ? (
                          <>
                            {userIsAssigned ? (
                              <span className="inline-block text-amber-600 text-[10px] font-bold uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 shadow-sm">In Progress</span>
                            ) : (
                              <span className="inline-block text-slate-500 text-[10px] font-bold uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">Pending</span>
                            )}
                            <button
                              onClick={() => onComplete(t._id)}
                              className="btn-primary text-xs px-3 py-1 flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Complete
                            </button>
                          </>
                        ) : (
                          <span className="inline-block text-emerald-600 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shadow-sm">Completed</span>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
