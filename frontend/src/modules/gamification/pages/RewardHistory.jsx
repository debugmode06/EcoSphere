import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMe } from '../../../api/authApi';
import { ArrowLeft, Gift, Calendar, Coins } from 'lucide-react';

export default function RewardHistory() {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await getMe();
      // Mapped redemptions
      setRedemptions(res.data.redemptions || []);
    } catch (err) {
      setError('Failed to load your redemption history.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/gamification/rewards" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="page-header">Redemption History</h2>
          <p className="page-subheader">Review your claimed eco-friendly rewards and vouchers</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-400 text-center">{error}</p>
      ) : redemptions.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 bg-slate-50 border border-slate-200">
          <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-bold text-slate-700">No items redeemed yet</p>
          <p className="text-sm mt-1 text-slate-500">Claim items from the Reward Store using your points balance.</p>
          <Link to="/gamification/rewards" className="btn-primary mt-4 text-xs font-bold inline-block">
            Browse Store
          </Link>
        </div>
      ) : (
        <div className="card bg-white p-4 space-y-2 border border-slate-200 shadow-md">
          {redemptions.map((red, index) => {
            const rewardItem = red.reward || {};
            return (
              <div
                key={index}
                className="p-4 bg-white rounded-xl flex items-center justify-between border border-slate-200 hover:border-slate-350 transition-all duration-150"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl mt-1 border border-slate-200 flex-shrink-0">
                    <Gift className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {rewardItem.name || 'Reward Item'}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold mt-0.5 line-clamp-1">
                      {rewardItem.description || 'Redeemed item'}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Redeemed: {new Date(red.redeemedAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-bold text-xs text-yellow-750 bg-yellow-50 border border-yellow-200/50 px-3 py-1 rounded-lg flex-shrink-0">
                  <Coins className="w-3.5 h-3.5 fill-yellow-500 stroke-none" />
                  {rewardItem.pointsRequired || 0} pts
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
