import React from 'react';
import { ShieldCheck, Calendar, MessageSquare, Clock, Globe, Award } from 'lucide-react';
import Button from '../common/Button';

const Hero = ({ therapist, onBookClick, onInquiryClick }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-white to-white pt-12 pb-16 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Avatar & Badges */}
          <div className="relative shrink-0">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden ring-4 ring-teal-500/20 shadow-xl bg-slate-100">
              <img
                src={
                  therapist?.avatar ||
                  'https://images.unsplash.com/photo-1594824813593-3c94f57c5a92?auto=format&fit=crop&w=600&q=80'
                }
                alt={therapist?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white px-2.5 py-1 rounded-full shadow-md border border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-teal-700">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Verified RCI</span>
            </div>
          </div>

          {/* Therapist Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/60 text-teal-800 text-xs font-semibold mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>{therapist?.qualifications?.join(' • ') || 'Licensed Clinical Psychologist'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {therapist?.name}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium mt-1">
              {therapist?.title}
            </p>

            {/* Quick Stat Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-xl">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>{therapist?.years_of_experience || 7}+ Years Practice</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-xl">
                <Globe className="w-4 h-4 text-teal-600" />
                <span>{therapist?.languages?.join(', ') || 'English, Hindi'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-teal-50 px-3 py-1.5 rounded-xl text-teal-800 font-semibold border border-teal-200/50">
                <span>₹{therapist?.hourly_rate?.toLocaleString('en-IN') || '1,500'}</span>
                <span className="font-normal text-teal-600">/ 60-min session</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 mt-6">
              <Button size="lg" icon={Calendar} onClick={onBookClick}>
                Book a Session
              </Button>
              <Button variant="outline" size="lg" icon={MessageSquare} onClick={onInquiryClick}>
                Send Practice Inquiry
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
