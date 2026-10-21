import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const UpgradeModal = ({ isOpen, onClose, data }) => {
  const { entitlement, refreshEntitlement } = useAuth();
  const [loadingTier, setLoadingTier] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const currentTier = entitlement?.currentTier?.key || 'free';

  const handleUpgrade = async (tierKey) => {
    try {
      setLoadingTier(tierKey);
      setSuccessMsg('');
      const res = await axiosInstance.post('/therapist/subscription/upgrade', { tier_key: tierKey });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        await refreshEntitlement();
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
        }, 1200);
      }
    } catch (err) {
      console.error('Upgrade error:', err);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="text-center pb-3">
        <div className="inline-flex p-3 rounded-2xl bg-amber-50 text-amber-600 mb-3 border border-amber-200">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          {data?.featureName ? `Upgrade to Unlock ${data.featureName}` : 'Expand Your Private Practice Capacity'}
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1.5">
          {data?.description || 'You have reached the limit of your current plan. Upgrade to unlock structured SOAP/DAP notes, higher client caps, and in-depth practice analytics.'}
        </p>

        {successMsg && (
          <div className="mt-4 p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            {successMsg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Pro Plan */}
        <div
          className={`rounded-2xl p-5 border text-left relative transition-all ${
            currentTier === 'pro'
              ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20'
              : 'border-slate-200 hover:border-teal-300 bg-white'
          }`}
        >
          {currentTier === 'pro' && (
            <span className="absolute top-3 right-3 text-[11px] font-semibold bg-teal-600 text-white px-2 py-0.5 rounded-full">
              Current Plan
            </span>
          )}
          <h3 className="font-bold text-lg text-slate-900">Professional</h3>
          <p className="text-xs text-slate-500 mt-0.5">For growing therapists</p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900">₹1,999</span>
            <span className="text-xs text-slate-500">/ month</span>
          </div>

          <ul className="mt-4 space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-teal-600 shrink-0" />
              <span><strong>25 Active Clients</strong> capacity</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-teal-600 shrink-0" />
              <span><strong>SOAP Clinical Notes</strong> templates</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-teal-600 shrink-0" />
              <span><strong>Advanced Analytics</strong> & load trends</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Automated WhatsApp/Email reminders</span>
            </li>
          </ul>

          <div className="mt-6">
            <Button
              variant={currentTier === 'pro' ? 'outline' : 'primary'}
              size="sm"
              className="w-full"
              disabled={currentTier === 'pro'}
              isLoading={loadingTier === 'pro'}
              onClick={() => handleUpgrade('pro')}
            >
              {currentTier === 'pro' ? 'Current Plan' : 'Select Professional'}
            </Button>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div
          className={`rounded-2xl p-5 border text-left relative transition-all ${
            currentTier === 'enterprise'
              ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20'
              : 'border-slate-200 hover:border-indigo-300 bg-white'
          }`}
        >
          {currentTier === 'enterprise' && (
            <span className="absolute top-3 right-3 text-[11px] font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
              Current Plan
            </span>
          )}
          <h3 className="font-bold text-lg text-slate-900">Enterprise Practice</h3>
          <p className="text-xs text-slate-500 mt-0.5">High volume practice</p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900">₹4,999</span>
            <span className="text-xs text-slate-500">/ month</span>
          </div>

          <ul className="mt-4 space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-indigo-600 shrink-0" />
              <span><strong>Unlimited Active Clients</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-indigo-600 shrink-0" />
              <span><strong>SOAP & DAP</strong> note formats</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Full MongoDB practice aggregations</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Custom branding & Priority Support</span>
            </li>
          </ul>

          <div className="mt-6">
            <Button
              variant={currentTier === 'enterprise' ? 'outline' : 'secondary'}
              size="sm"
              className="w-full"
              disabled={currentTier === 'enterprise'}
              isLoading={loadingTier === 'enterprise'}
              onClick={() => handleUpgrade('enterprise')}
            >
              {currentTier === 'enterprise' ? 'Current Plan' : 'Select Enterprise'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UpgradeModal;
