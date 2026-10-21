import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import StatCard from '../../components/analytics/StatCard';
import RevenueChart from '../../components/analytics/RevenueChart';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import useEntitlement from '../../hooks/useEntitlement';

const COLORS = ['#0d9488', '#f59e0b', '#ef4444', '#64748b'];

const Analytics = () => {
  const { promptUpgrade } = useEntitlement();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axiosInstance.get('/analytics/dashboard');
        if (res.data.success) {
          setData(res.data.analytics);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <Loader text="Calculating practice aggregation pipelines..." />;
  }

  const summary = data?.summary || {};
  const isAdvancedAllowed = data?.isAdvancedAllowed;

  // Session completion pie chart data
  const pieData = [
    { name: 'Completed', value: summary.completedSessions || 0 },
    { name: 'No-Show', value: summary.noShowSessions || 0 },
    { name: 'Cancelled', value: summary.cancelledSessions || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Practice Intelligence & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real MongoDB aggregation queries computing retention, earnings, and scheduling efficiency.
          </p>
        </div>

        {!isAdvancedAllowed && (
          <Button size="sm" icon={Sparkles} onClick={() => promptUpgrade('Advanced Analytics Pipeline')}>
            Unlock Full Analytics
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Practice Revenue"
          value={`₹${summary.totalRevenue?.toLocaleString('en-IN') || 0}`}
          subtitle="All-time gross received"
          icon={DollarSign}
          color="teal"
        />
        <StatCard
          title="Net Practice Income"
          value={`₹${summary.totalNet?.toLocaleString('en-IN') || 0}`}
          subtitle="Net after 2% platform fee"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Active Practice Roster"
          value={summary.activeClientsCount || 0}
          subtitle="Clients in ongoing therapy"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Session Completion"
          value={`${summary.completionRate || 0}%`}
          subtitle={`No-show rate: ${summary.noShowRate || 0}%`}
          icon={Calendar}
          color="amber"
        />
      </div>

      {/* Trajectory Area Chart */}
      <RevenueChart
        data={data?.revenueTrend || []}
        isAdvancedAllowed={isAdvancedAllowed}
        onUpgradeClick={() => promptUpgrade('Advanced Revenue Analytics')}
      />

      {/* Lower Analytical Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Status Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-left">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-teal-600" />
            <span>Session Completion Breakdown</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribution across completed sessions, client cancellations, and no-shows.
          </p>

          <div className="h-64 mt-4 flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400">Not enough session history to plot distribution</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex justify-center gap-6 text-xs mt-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-teal-600" />
              <span className="text-slate-600">Completed ({summary.completedSessions || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-600">No-Show ({summary.noShowSessions || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-600">Cancelled ({summary.cancelledSessions || 0})</span>
            </div>
          </div>
        </div>

        {/* Day-of-Week Load Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-left relative">
          <h3 className="font-bold text-slate-900 text-base">Day-of-Week Appointment Load</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify peak clinical days to optimize your weekly schedule.
          </p>

          <div className="h-64 mt-4">
            {data?.dayOfWeekDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dayOfWeekDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="sessionCount" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>{isAdvancedAllowed ? 'No day load data yet' : 'Advanced load chart available on Pro tier'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
