import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Globe, LogIn, User } from 'lucide-react';

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
      // AppRouter redirects based on role automatically
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-500/20 pulse-glow mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            ESG Management &amp; Sustainability Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-8 bg-white/80 backdrop-blur-md relative border-slate-200">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
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

          {/* Demo Credentials Quick Fill */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3 text-center">
              Demo Credentials
            </p>
            <div className="space-y-2">
              {DEMO_CREDENTIALS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleDemoClick(demo)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-brand-200 text-left transition-all duration-150 group"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-500" />
                    <div>
                      <p className="text-slate-700 text-xs font-medium">{demo.role}</p>
                      <p className="text-slate-500 text-[10px]">{demo.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-md font-mono">
                    Quick Fill
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
