import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createChallenge, getChallengeById, updateChallenge } from '../../../api/gamificationApi';
import { getCategories } from '../../../api/coreApi';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';

export default function ChallengeCreateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/gamification/challenges', { replace: true });
    }
  }, [user, navigate]);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    xp: 100,
    difficulty: 'Medium',
    evidenceRequired: false,
    deadline: '',
    status: 'DRAFT'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
    if (isEditMode) {
      loadChallenge();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      // Filter only CHALLENGE category types
      const filtered = res.data.filter((c) => c.type === 'CHALLENGE');
      setCategories(filtered);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const loadChallenge = async () => {
    setLoading(true);
    try {
      const res = await getChallengeById(id);
      const data = res.data;
      setForm({
        title: data.title || '',
        category: data.category?._id || data.category || '',
        description: data.description || '',
        xp: data.xp || 100,
        difficulty: data.difficulty || 'Medium',
        evidenceRequired: !!data.evidenceRequired,
        deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
        status: data.status || 'DRAFT'
      });
    } catch (err) {
      setError('Failed to fetch challenge details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      category: form.category || undefined,
      deadline: form.deadline ? new Date(form.deadline) : undefined
    };

    try {
      if (isEditMode) {
        await updateChallenge(id, payload);
      } else {
        await createChallenge(payload);
      }
      navigate('/gamification/challenges');
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving the challenge.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/gamification/challenges" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="page-header">{isEditMode ? 'Edit Challenge' : 'New Challenge'}</h2>
          <p className="page-subheader">{isEditMode ? 'Update sustainability challenge parameters' : 'Design a new gamified sustainability milestone'}</p>
        </div>
      </div>

      <div className="card p-6 bg-white">
        <form onSubmit={handleSubmit} className="space-y-5" id="challenge-form">
          <div>
            <label className="label" htmlFor="challenge-title">Challenge Title</label>
            <input
              id="challenge-title"
              type="text"
              className="input"
              placeholder="e.g. Bring Reusable Cup to Cafe"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="challenge-category">Category</label>
              <select
                id="challenge-category"
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="challenge-difficulty">Difficulty</label>
              <select
                id="challenge-difficulty"
                className="input"
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="challenge-description">Description</label>
            <textarea
              id="challenge-description"
              className="input min-h-[100px]"
              placeholder="Describe what the employee needs to accomplish to complete this challenge..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label" htmlFor="challenge-xp">XP Reward</label>
              <input
                id="challenge-xp"
                type="number"
                min="10"
                step="10"
                className="input"
                value={form.xp}
                onChange={(e) => setForm({ ...form, xp: parseInt(e.target.value, 10) })}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="challenge-deadline">Deadline</label>
              <input
                id="challenge-deadline"
                type="date"
                className="input"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="challenge-status">Status</label>
              <select
                id="challenge-status"
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-200">
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-slate-700" htmlFor="evidenceRequired">Evidence Submission Required</label>
              <p className="text-xs text-slate-500 leading-normal">Requires users to submit a valid URL of image/document proof when completing.</p>
            </div>
            <input
              type="checkbox"
              id="evidenceRequired"
              className="w-5 h-5 accent-brand-600 rounded bg-white border-slate-300 focus:ring-brand-500"
              checked={form.evidenceRequired}
              onChange={(e) => setForm({ ...form, evidenceRequired: e.target.checked })}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              id="save-challenge-btn"
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Challenge'}
            </button>
            <Link to="/gamification/challenges" className="btn-secondary flex-1 text-center">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
