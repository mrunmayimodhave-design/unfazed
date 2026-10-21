import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  BarChart3,
  ExternalLink,
  Sparkles,
  LogOut,
  Menu,
  X,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const { therapist, isAuthenticated, logout, openUpgradeModal, entitlement } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tierKey = entitlement?.currentTier?.key || therapist?.subscription_tier || 'free';

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition">
                  Unfazed
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-600 -mt-1">
                  Therapy OS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation links */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right section: Profile / Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Public Branded Page Link */}
                {therapist?.slug && (
                  <Link
                    to={`/${therapist.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 text-teal-700 bg-teal-50/50 hover:bg-teal-100/70 text-xs font-semibold transition"
                    title="View public client booking portal"
                  >
                    <span>My Branded Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}

                {/* Tier Badge */}
                <button
                  onClick={() => openUpgradeModal()}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                    tierKey === 'enterprise'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : tierKey === 'pro'
                      ? 'bg-teal-50 border-teal-200 text-teal-700'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="capitalize">{tierKey} Plan</span>
                </button>

                {/* Therapist Info & Logout */}
                <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {therapist?.name || 'Therapist'}
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      {therapist?.title ? therapist.title.substring(0, 24) + '...' : 'Practice Owner'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/therapists"
                  className="text-sm font-bold text-teal-700 hover:text-teal-800 px-3 py-2 flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Find Therapists</span>
                </Link>
                <a
                  href="/#features"
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
                >
                  Features
                </a>
                <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2">
                  Sign in
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {isAuthenticated ? (
            <>
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium ${
                    location.pathname === item.path
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className="w-5 h-5 text-teal-600" />
                  {item.name}
                </Link>
              ))}

              {therapist?.slug && (
                <Link
                  to={`/${therapist.slug}`}
                  target="_blank"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-teal-700 bg-teal-50 rounded-xl"
                >
                  <span>Open Public Branded Link</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openUpgradeModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 rounded-xl"
              >
                <span>Subscription: {tierKey.toUpperCase()}</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-base font-medium text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <Link
                to="/therapists"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl bg-teal-600 text-white font-semibold shadow-sm"
              >
                Browse All Therapists
              </Link>
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl bg-slate-50 text-slate-800 font-semibold"
              >
                Platform Features
              </a>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl bg-teal-600 text-white font-semibold shadow-md"
              >
                Sign Up as Therapist
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
