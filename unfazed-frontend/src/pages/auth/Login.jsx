import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('dr.ananya@unfazed.in');
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 text-left">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-teal-500/20">
            <HeartPulse className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Therapist Portal Login</h2>
          <p className="text-xs text-slate-500">Sign in to manage your practice calendar, clients & notes</p>
        </div>

        {/* 1-Click Demo Login Pill */}
        <div
          onClick={fillDemoCredentials}
          className="p-3 bg-teal-50/80 border border-teal-200/80 rounded-2xl cursor-pointer hover:bg-teal-100/70 transition flex items-center justify-between"
          title="Click to auto-fill seeded demo therapist account"
        >
          <div className="flex items-center gap-2 text-xs text-teal-900">
            <KeyRound className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <p className="font-bold">Try Demo Therapist Account</p>
              <p className="text-[11px] text-teal-700">dr.ananya@unfazed.in • Password123!</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-teal-600 bg-white px-2 py-0.5 rounded-lg shadow-xs">
            Auto-fill
          </span>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@unfazed.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full mt-2" isLoading={loading} icon={ArrowRight}>
            Sign In to Practice
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2">
          New to Unfazed?{' '}
          <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
            Create Therapist Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
