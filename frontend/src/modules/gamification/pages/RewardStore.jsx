import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRewards, createReward, redeemReward } from '../../../api/gamificationApi';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/ui/Modal';
import { Gift, Plus, Coins, History, ShieldCheck } from 'lucide-react';

export default function RewardStore() {
  const { user, setUser, role } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [redeemingId, setRedeemingId] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    pointsRequired: 100,
    stock: 10
  });

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    setLoading(true);
    try {
      const res = await getRewards();
      setRewards(res.data);
    } catch (err) {
      setError('Failed to fetch rewards.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createReward({
        ...form,
        status: 'Active'
      });
      setOpenModal(false);
      setForm({ name: '', description: '', pointsRequired: 100, stock: 10 });
      await loadRewards();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred while saving the reward.');
    } finally {
      setSaving(false);
    }
  };

  const handleRedeem = async (reward) => {
    if (!window.confirm(`Are you sure you want to redeem "${reward.name}" for ${reward.pointsRequired} points?`)) {
      return;
    }
    setRedeemingId(reward._id);
    try {
      const res = await redeemReward(reward._id);
      const remainingPoints = res.data.remainingPoints;
      
      // Update points in Context & LocalStorage
      const updatedUser = { ...user, points: remainingPoints };
      setUser(updatedUser);
      localStorage.setItem('ecosphere_user', JSON.stringify(updatedUser));

      alert('✅ Reward redeemed successfully! You can collect it from your office HR.');
      await loadRewards();
    } catch (err) {
      alert(err.response?.data?.message || 'Redemption failed.');
    } finally {
      setRedeemingId('');
    }
  };

  const isAdmin = role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-header">Reward Store</h2>
          <p className="page-subheader">Redeem your hard-earned points for exclusive eco-friendly gifts</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/gamification/rewards/history" className="btn-secondary text-sm font-semibold flex items-center gap-2">
            <History className="w-4 h-4" /> Redemption History
          </Link>
          {isAdmin && (
            <button onClick={() => setOpenModal(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Reward Item
            </button>
          )}
        </div>
      </div>

      {user && (
        <div className="card p-5 bg-gradient-to-r from-yellow-50/50 to-slate-50 border border-yellow-250 flex items-center gap-4">
          <div className="bg-yellow-50 p-3 rounded-2xl border border-yellow-200">
            <Coins className="w-8 h-8 text-yellow-500 fill-yellow-500/10" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Your Point Balance</p>
            <p className="text-3xl font-black text-yellow-705 mt-0.5">
              {user.points || 0} <span className="text-sm font-semibold text-slate-450">pts available</span>
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-400 text-center">{error}</p>
      ) : rewards.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 bg-slate-50 border border-slate-200">
          <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-bold text-slate-700">No rewards currently in stock</p>
          <p className="text-sm mt-1 text-slate-500">Check back later for fresh listings!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((r) => {
            const hasEnoughPoints = (user?.points || 0) >= r.pointsRequired;
            const isOutOfStock = r.stock <= 0;

            return (
              <div
                key={r._id}
                className={`card p-5 space-y-4 hover:border-yellow-500/30 transition-all duration-300 flex flex-col justify-between ${
                  isOutOfStock ? 'opacity-65' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <Gift className="w-5 h-5 text-yellow-500" />
                    </div>
                    {isOutOfStock ? (
                      <span className="badge-red text-xs font-bold px-2 py-0.5 rounded-full">Out of Stock</span>
                    ) : (
                      <span className="badge-green text-xs font-bold px-2 py-0.5 rounded-full">
                        {r.stock} Items Remaining
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{r.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {r.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1 text-yellow-650 font-black">
                    <Coins className="w-4 h-4 fill-yellow-500 stroke-none" />
                    {r.pointsRequired} pts
                  </div>

                  <button
                    onClick={() => handleRedeem(r)}
                    disabled={isOutOfStock || !hasEnoughPoints || redeemingId === r._id}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
                      isOutOfStock || !hasEnoughPoints
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-yellow-500 hover:bg-yellow-450 text-slate-950 hover:shadow-lg hover:shadow-yellow-500/10'
                    }`}
                  >
                    {redeemingId === r._id ? 'Redeeming...' : 'Redeem Reward'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Reward Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Create New Reward Item">
        <form onSubmit={handleCreate} className="space-y-4" id="reward-form">
          <div>
            <label className="label" htmlFor="reward-name">Item Name</label>
            <input
              id="reward-name"
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="reward-description">Description</label>
            <textarea
              id="reward-description"
              className="input min-h-[80px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Give details about how and where to collect this reward..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="reward-pointsRequired">Points Cost</label>
              <input
                id="reward-pointsRequired"
                type="number"
                min="10"
                className="input"
                value={form.pointsRequired}
                onChange={(e) => setForm({ ...form, pointsRequired: parseInt(e.target.value, 10) })}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="reward-stock">Initial Stock</label>
              <input
                id="reward-stock"
                type="number"
                min="1"
                className="input"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value, 10) })}
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" /> {saving ? 'Adding...' : 'Add Reward'}
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
