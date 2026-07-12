import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, User, Globe, LogIn } from 'lucide-react';

const DEMO_CREDENTIALS = [
  { role: 'ADMIN', email: 'admin@ecosphere.com', password: 'Admin@123' },
  { role: 'MANAGER', email: 'manager1@ecosphere.com', password: 'Manager@123' },
  { role: 'EMPLOYEE', email: 'emp1@ecosphere.com', password: 'Emp@123' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please enter both email and password');

    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-700 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 pulse-glow">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight gradient-text">
            Welcome to EcoSphere
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            ESG Management & Sustainability Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-8 bg-slate-900/80 backdrop-blur-md relative border-slate-800">
          {error && (
            <div className="mb-4 bg-red-900/30 border border-red-700/50 text-red-200 text-sm px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-3 text-center">
              Quick Connect (Demo Credentials)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_CREDENTIALS.map((demo) => (
                <button
                  key={demo.role}
                  onClick={() => handleDemoClick(demo)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-lg text-[11px] font-medium text-slate-300 hover:text-slate-100 transition-all text-center uppercase"
                >
                  {demo.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
