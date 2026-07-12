import { useState, useEffect } from 'react';
import useCSRActivities from '../hooks/useCSRActivities';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../../../context/AuthContext';
import CSRForm from '../components/CSRForm';
import JoinActivity from '../components/JoinActivity';
import { useMyParticipations } from '../hooks/useParticipations';
import { Plus, Edit2, Trash2, Send, MapPin, Calendar, Users2, Eye } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';

// Minimal hook to fetch departments
function useDepartments() {
  const [departments, setDepartments] = useState([]);
  useEffect(() => {
    axiosClient.get('/core/departments').then((r) => setDepartments(r.data.departments || [])).catch(() => { });
  }, []);
  return departments;
}

const STATUS_STYLE = {
  draft: 'badge-yellow',
  active: 'badge-green',
  closed: 'badge-red',
};

export default function CSRActivities() {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN' || role === 'MANAGER';

  const { activities, loading, error, createActivity, updateActivity, deleteActivity, publishActivity } = useCSRActivities();
  const { categories } = useCategories();
  const departments = useDepartments();
  const { joinActivity, participations } = useMyParticipations();

  const joinedIds = new Set(participations.map((p) => p.csrActivityId?._id || p.csrActivityId));

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [joining, setJoining] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleCreate = () => { setSelected(null); setFormOpen(true); };
  const handleEdit = (a) => { setSelected(a); setFormOpen(true); };

  const handleFormSubmit = async (data) => {
    if (selected) await updateActivity(selected._id, data);
    else await createActivity(data);
  };

  const handlePublish = async (id) => {
    setActionError(null);
    try { await publishActivity(id); }
    catch (e) { setActionError(e.response?.data?.message || e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this activity?')) return;
    try { await deleteActivity(id); }
    catch (e) { setActionError(e.response?.data?.message || e.message); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">CSR Activities</h1>
          <p className="page-subheader">Corporate Social Responsibility programs and initiatives.</p>
        </div>
        {isAdmin && (
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Activity
          </button>
        )}
      </div>

      {(error || actionError) && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-200 text-sm px-4 py-2.5 rounded-xl">
          {error || actionError}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading activities...</div>
      ) : activities.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          No activities found. {isAdmin && 'Create one to get started.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activities.map((act) => {
            const alreadyJoined = joinedIds.has(act._id);
            return (
              <div key={act._id} className="card p-5 flex flex-col gap-3 hover:border-slate-600 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-100 leading-snug">{act.title}</h3>
                  <span className={`${STATUS_STYLE[act.status]} shrink-0`}>{act.status}</span>
                </div>
                {act.description && (
                  <p className="text-slate-400 text-sm line-clamp-2">{act.description}</p>
                )}
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-400" /> {act.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-brand-400" />
                    {new Date(act.startDate).toLocaleDateString()} — {new Date(act.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users2 className="w-3.5 h-3.5 text-brand-400" /> Max {act.maxParticipants} participants
                  </div>
                </div>
                {act.evidenceRequired && (
                  <div className="text-xs text-yellow-300 bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-2.5 py-1.5">
                    ⚠️ Proof required for approval
                  </div>
                )}
                <div className="mt-auto pt-3 border-t border-slate-700/50 flex flex-wrap gap-2">
                  {isAdmin && (
                    <>
                      <button onClick={() => handleEdit(act)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      {act.status === 'draft' && (
                        <button onClick={() => handlePublish(act._id)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                          <Send className="w-3 h-3" /> Publish
                        </button>
                      )}
                      <button onClick={() => handleDelete(act._id)} className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </>
                  )}
                  {!isAdmin && act.status === 'active' && !alreadyJoined && (
                    <button onClick={() => setJoining(act)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                      <Users2 className="w-3 h-3" /> Join
                    </button>
                  )}
                  {alreadyJoined && (
                    <span className="badge-green text-xs px-3 py-1.5">✓ Joined</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <CSRForm
          activity={selected}
          categories={categories}
          departments={departments}
          onSubmit={handleFormSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}
      {joining && (
        <JoinActivity
          activity={joining}
          onJoin={joinActivity}
          onClose={() => setJoining(null)}
        />
      )}
    </div>
  );
}
