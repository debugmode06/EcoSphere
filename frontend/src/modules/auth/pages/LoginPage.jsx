import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, User } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // AuthContext will update state and AppRouter will redirect to /dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />

      {/* Main card */}
      <div className="w-full max-w-md card p-8 border border-slate-800 shadow-2xl relative z-10">
        
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-700 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-brand-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">EcoSphere</h1>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-semibold">
            Governance & ESG Platform
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 flex items-center gap-2 bg-red-950/40 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                type="email"
                className="input pl-10"
                placeholder="you@ecosphere.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                type="password"
                className="input pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 mt-2 flex items-center justify-center gap-2 font-semibold"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">
            Demo Credentials
          </p>
          <div className="space-y-2">
            {[
              { role: 'ADMIN', email: 'admin@ecosphere.com', pw: 'Admin@123' },
              { role: 'MANAGER', email: 'manager1@ecosphere.com', pw: 'Manager@123' },
              { role: 'EMPLOYEE', email: 'emp1@ecosphere.com', pw: 'Emp@123' },
            ].map((cred) => (
              <button
                key={cred.role}
                onClick={() => handleQuickFill(cred.email, cred.pw)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/30 hover:bg-slate-900/60 hover:border-slate-700/50 text-left transition-all duration-150 group"
              >
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400" />
                  <div>
                    <p className="text-slate-300 text-xs font-medium">{cred.role}</p>
                    <p className="text-slate-500 text-[10px]">{cred.email}</p>
                  </div>
                </div>
                <span className="text-[10px] text-brand-400/80 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-md font-mono">
                  Quick Fill
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
