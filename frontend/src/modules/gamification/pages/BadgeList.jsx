import { useState, useEffect } from 'react';
import { getBadges, createBadge } from '../../../api/gamificationApi';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/ui/Modal';
import { Award, Plus, Lock, Unlock, Zap, ShieldCheck } from 'lucide-react';

const TYPE_LABELS = {
  xp: 'XP Threshold',
  challengeCount: 'Challenges Completed',
  csrCount: 'CSR Activities',
  carbonSaved: 'Carbon Saved (kg CO₂)'
};

export default function BadgeList() {
  const { user, role } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    unlockType: 'xp',
    threshold: 100,
    icon: '🏅'
  });

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    setLoading(true);
    try {
      const res = await getBadges();
      setBadges(res.data);
    } catch (err) {
      setError('Failed to fetch badges list.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createBadge(form);
      setOpenModal(false);
      setForm({ name: '', description: '', unlockType: 'xp', threshold: 100, icon: '🏅' });
      await loadBadges();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred while saving the badge.');
    } finally {
      setSaving(false);
    }
  };

  // Helper to check if user has earned badge
  const isUnlocked = (badgeId) => {
    if (!user || !user.badges) return false;
    return user.badges.some((b) => b === badgeId || b._id === badgeId);
  };

  const isAdmin = role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-header">Achievements & Badges</h2>
          <p className="page-subheader">Earn badges automatically by contributing to sustainability goals</p>
        </div>
        {isAdmin && (
          <button onClick={() => setOpenModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Badge
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-400 text-center">{error}</p>
      ) : badges.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 bg-slate-50 border border-slate-200">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-bold text-slate-700">No achievements configured yet</p>
          <p className="text-sm mt-1 text-slate-500">Check back later once the system achievements are published.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {badges.map((b) => {
            const unlocked = isUnlocked(b._id);
            return (
              <div
                key={b._id}
                className={`card p-6 flex flex-col items-center text-center justify-between gap-4 transition-all duration-300 relative overflow-hidden ${
                  unlocked
                    ? 'border-yellow-300 bg-gradient-to-b from-yellow-50/50 to-white shadow-lg shadow-yellow-100/30'
                    : 'border-slate-200 bg-white opacity-80'
                }`}
              >
                {/* Unlock status badge absolute */}
                <div className="absolute top-3 right-3">
                  {unlocked ? (
                    <span className="text-emerald-700 flex items-center gap-0.5 text-[10px] font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                      <Unlock className="w-2.5 h-2.5 animate-pulse" /> UNLOCKED
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-0.5 text-[10px] font-extrabold bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                      <Lock className="w-2.5 h-2.5" /> LOCKED
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center space-y-3 mt-4">
                  <div className={`text-6xl p-2 rounded-2xl transition-transform duration-300 ${unlocked ? 'scale-110 drop-shadow-[0_4px_12px_rgba(234,179,8,0.15)]' : 'grayscale opacity-40'}`}>
                    {b.icon || '🏅'}
                  </div>
                  <div>
                    <h3 className={`text-base font-extrabold transition-colors ${unlocked ? 'text-yellow-650' : 'text-slate-500'}`}>
                      {b.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold mt-1 leading-normal">
                      {b.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Zap className="w-4 h-4 text-brand-600" />
                  <span>{b.threshold} {TYPE_LABELS[b.unlockType] || b.unlockType}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Badge Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Create New Achievement Badge">
        <form onSubmit={handleCreate} className="space-y-4" id="badge-form">
          <div>
            <label className="label" htmlFor="badge-name">Badge Name</label>
            <input
              id="badge-name"
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="badge-description">Description</label>
            <input
              id="badge-description"
              type="text"
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Completed your first green initiative"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="badge-unlockType">Unlock Type</label>
              <select
                id="badge-unlockType"
                className="input"
                value={form.unlockType}
                onChange={(e) => setForm({ ...form, unlockType: e.target.value })}
              >
                <option value="xp">XP Threshold</option>
                <option value="challengeCount">Challenges Count</option>
                <option value="csrCount">CSR Activity Count</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="badge-threshold">Threshold Requirement</label>
              <input
                id="badge-threshold"
                type="number"
                min="1"
                className="input"
                value={form.threshold}
                onChange={(e) => setForm({ ...form, threshold: parseInt(e.target.value, 10) })}
                required
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="badge-icon">Emoji Icon</label>
            <input
              id="badge-icon"
              type="text"
              maxLength="3"
              className="input text-center text-xl font-bold"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="🏅"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" /> {saving ? 'Saving...' : 'Create Badge'}
            </button>
            <button type="button" onClick={() => setOpenModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
