import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Sparkles } from 'lucide-react';
import Button from '../common/Button';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
        <p className="font-bold">{label}</p>
        <p className="text-teal-300">
          Revenue: ₹{payload[0].value?.toLocaleString('en-IN')}
        </p>
        {payload[1] && (
          <p className="text-emerald-300">
            Net Earnings: ₹{payload[1].value?.toLocaleString('en-IN')}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ data = [], isAdvancedAllowed = true, onUpgradeClick }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Practice Revenue Trajectory</h3>
          <p className="text-xs text-slate-500">Gross revenue and net earnings after platform processing</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-500" />
            <span className="text-slate-600">Gross Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-slate-600">Net Earnings</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="monthName"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0d9488"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="net"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorNet)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {!isAdvancedAllowed && (
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-5 rounded-2xl shadow-xl max-w-sm border border-slate-200">
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">Advanced Revenue Analytics Locked</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Upgrade to Pro or Enterprise to access 12-month historical revenue forecasting and day-by-day load analysis.
            </p>
            <Button size="sm" onClick={onUpgradeClick}>
              Unlock Advanced Analytics
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
