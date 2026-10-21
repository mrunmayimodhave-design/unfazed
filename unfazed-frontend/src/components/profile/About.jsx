import React from 'react';
import { Heart, Sparkles, BookOpen } from 'lucide-react';

const About = ({ therapist }) => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clinical Bio */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs tracking-wider uppercase mb-2">
              <BookOpen className="w-4 h-4" />
              <span>About Practice</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">
              A Warm, Non-Judgmental Space for Deep Healing
            </h2>
            <div className="prose prose-slate text-slate-600 leading-relaxed text-sm sm:text-base space-y-3">
              <p>{therapist?.bio}</p>
              <p>
                My clinical practice integrates cognitive, behavioral, and experiential therapies to help you build resilient coping systems, heal past relational wounds, and clarify what truly matters to you.
              </p>
            </div>

            {/* Specializations */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Specialized Areas of Focus</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {therapist?.specializations?.map((spec, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium hover:bg-teal-50 hover:text-teal-800 transition"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick FAQ / Session Structure sidebar */}
          <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/70 h-fit space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>What to Expect</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div>
                <p className="font-semibold text-slate-800">100% Confidential</p>
                <p>Sessions follow strict Indian clinical confidentiality standards.</p>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <p className="font-semibold text-slate-800">Flexible Online Video</p>
                <p>Join sessions from the comfort of your private space via secure video link.</p>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <p className="font-semibold text-slate-800">GST Invoice Provided</p>
                <p>Auto-generated tax invoices eligible for corporate wellness reimbursement.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
