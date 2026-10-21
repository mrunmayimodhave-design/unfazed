import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import Button from '../common/Button';

const ServiceCard = ({ pkg, onSelectPackage, isPopular = false }) => {
  return (
    <div
      className={`rounded-2xl p-6 border relative transition-all duration-200 flex flex-col justify-between ${
        isPopular
          ? 'border-teal-500 bg-gradient-to-b from-teal-50/40 via-white to-white ring-2 ring-teal-500/20 shadow-lg'
          : 'border-slate-200 bg-white hover:border-teal-300 shadow-xs hover:shadow-md'
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
          <Sparkles className="w-3 h-3" />
          Most Popular
        </span>
      )}

      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-slate-900">{pkg.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{pkg.session_count} Individual Sessions</p>
          </div>
          {pkg.discount_percent > 0 && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
              Save {pkg.discount_percent}%
            </span>
          )}
        </div>

        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-slate-900">
            ₹{pkg.total_price?.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-500">
            (₹{Math.round(pkg.per_session_rate)} / session)
          </span>
        </div>

        <p className="text-xs text-slate-600 mt-3 leading-relaxed">
          {pkg.description || 'Flexible sessions with dedicated clinical support and tailored session notes.'}
        </p>

        <ul className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Valid for <strong>{pkg.validity_days || 90} days</strong></span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Includes shared weekly clinical exercises</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-600 shrink-0" />
            <span>GST Tax Invoice provided instantly</span>
          </li>
        </ul>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <Button
          variant={isPopular ? 'primary' : 'outline'}
          className="w-full"
          onClick={() => onSelectPackage(pkg)}
        >
          Book Package
        </Button>
      </div>
    </div>
  );
};

export default ServiceCard;
