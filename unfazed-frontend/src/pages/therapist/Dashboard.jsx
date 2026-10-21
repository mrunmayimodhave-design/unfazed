import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  CreditCard,
  FileText,
  ExternalLink,
  Plus,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import StatCard from '../../components/analytics/StatCard';
import RevenueChart from '../../components/analytics/RevenueChart';
import CalendarView from '../../components/scheduling/Calendar';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import useEntitlement from '../../hooks/useEntitlement';

const Dashboard = () => {
  const { therapist, entitlement, openUpgradeModal } = useAuth();
  const { isClientCapReached, promptUpgrade, usage } = useEntitlement();

  const [analytics, setAnalytics] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, sessionsRes] = await Promise.all([
          axiosInstance.get('/analytics/dashboard'),
          axiosInstance.get('/scheduling/sessions?limit=5'),
        ]);

        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.analytics);
        }
        if (sessionsRes.data.success) {
          setRecentSessions(sessionsRes.data.sessions || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSessionStatusChange = async (sessionId, newStatus) => {
    try {
      await axiosInstance.put(`/scheduling/sessions/${sessionId}/status`, { status: newStatus });
      setRecentSessions((prev) =>
        prev.map((s) => (s._id === sessionId ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error('Error updating session status:', err);
    }
  };

  if (loading) {
    return <Loader text="Loading your practice dashboard..." />;
  }

  const summary = analytics?.summary || {};
  const activeClients = usage?.activeClients ?? summary.activeClientsCount ?? 0;
  const clientLimit = usage?.clientLimit ?? 5;
  const clientPercent = Math.min(100, Math.round((activeClients / clientLimit) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practice Management Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {therapist?.name}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Here is your daily clinical snapshot, schedule, and practice performance.
          </p>
        </div>

        {/* Quick Branded link widget */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-teal-200 uppercase tracking-wider">
            Your Public Booking Link
          </span>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono bg-black/30 px-2.5 py-1.5 rounded-lg text-teal-100">
              unfazed.in/{therapist?.slug}
            </code>
            <Link
              to={`/${therapist?.slug}`}
              target="_blank"
              className="p-1.5 rounded-lg bg-teal-500 text-slate-950 hover:bg-teal-400 transition"
              title="Open Public Link"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Client Capacity Alert if close to cap */}
      {clientPercent >= 80 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800">
              <strong>Plan Capacity Warning:</strong> You are using {activeClients} of your {clientLimit} active client slots ({clientPercent}%). Upgrade to accommodate more clients without interruption.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => promptUpgrade('Active Client Expansion')}>
            Upgrade Plan
          </Button>
        </div>
      )}

      {/* Practice KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Practice Gross Revenue"
          value={`₹${summary.totalRevenue?.toLocaleString('en-IN') || '0'}`}
          subtitle={`Net: ₹${summary.totalNet?.toLocaleString('en-IN') || '0'}`}
          icon={CreditCard}
          color="teal"
        />

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Clients</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {activeClients}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {clientLimit} cap</span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                clientPercent > 80 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${clientPercent}%` }}
            />
          </div>
        </div>

        <StatCard
          title="Total Sessions"
          value={summary.totalSessionsCount || 0}
          subtitle={`${summary.completedSessions || 0} completed`}
          icon={Calendar}
          color="emerald"
        />

        <StatCard
          title="No-Show Rate"
          value={`${summary.noShowRate || 0}%`}
          subtitle={`${summary.noShowSessions || 0} client missed`}
          icon={TrendingUp}
          color={summary.noShowRate > 15 ? 'rose' : 'amber'}
        />
      </div>

      {/* Practice Revenue Chart */}
      <RevenueChart
        data={analytics?.revenueTrend || []}
        isAdvancedAllowed={analytics?.isAdvancedAllowed}
        onUpgradeClick={() => promptUpgrade('Advanced Revenue Analytics')}
      />

      {/* Upcoming & Recent Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Upcoming Appointments</h2>
          <Link to="/schedule">
            <Button variant="ghost" size="sm">
              View Full Schedule
            </Button>
          </Link>
        </div>

        <CalendarView sessions={recentSessions} onStatusChange={handleSessionStatusChange} />
      </div>
    </div>
  );
};

export default Dashboard;
