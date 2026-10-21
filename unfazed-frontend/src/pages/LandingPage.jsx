import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  Calendar,
  ShieldCheck,
  CreditCard,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  Clock,
  Globe,
  Award,
  CheckCircle2,
  Lock,
  BarChart3,
  Video,
  ChevronRight,
  Zap,
} from 'lucide-react';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import axiosInstance from '../api/axiosInstance';

const LandingPage = () => {
  const [therapists, setTherapists] = useState([]);
  const [loadingTherapists, setLoadingTherapists] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const res = await axiosInstance.get('/therapist/directory');
        if (res.data.success) {
          setTherapists(res.data.therapists || []);
        }
      } catch (err) {
        console.error('Error fetching therapist directory:', err);
      } finally {
        setLoadingTherapists(false);
      }
    };

    fetchTherapists();
  }, []);

  const filterTags = [
    'All',
    'CBT',
    'Anxiety',
    'Depression',
    'Couples',
    'Trauma',
    'ADHD',
    'Adolescent',
    'Stress',
  ];

  const filteredTherapists = therapists.filter((t) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      t.name.toLowerCase().includes(query) ||
      t.title.toLowerCase().includes(query) ||
      t.specializations?.some((s) => s.toLowerCase().includes(query)) ||
      t.languages?.some((l) => l.toLowerCase().includes(query));

    const matchesTag =
      selectedTag === 'All' ||
      t.specializations?.some((s) => s.toLowerCase().includes(selectedTag.toLowerCase()));

    return matchesSearch && matchesTag;
  });

  const features = [
    {
      icon: Calendar,
      title: 'Timezone-Smart Scheduling',
      description:
        'Clients view your real-time open calendar in their local timezone. Automated buffer times and double-booking prevention.',
      color: 'bg-teal-500/10 text-teal-700',
    },
    {
      icon: FileText,
      title: 'Confidential SOAP Notes',
      description:
        'Isolated clinical records adhering to Indian healthcare confidentiality standards. Never visible to clients.',
      color: 'bg-indigo-500/10 text-indigo-700',
    },
    {
      icon: CreditCard,
      title: 'Razorpay & GST Invoices',
      description:
        'Secure advance payments with automatic issuance of 18% GST tax invoices under SAC code 999312.',
      color: 'bg-emerald-500/10 text-emerald-700',
    },
    {
      icon: Video,
      title: 'Encrypted Telehealth Calls',
      description:
        'Instant secure video meeting links generated automatically for every confirmed appointment.',
      color: 'bg-purple-500/10 text-purple-700',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 bg-gradient-to-b from-teal-50/70 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/70 text-teal-800 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Verified Mental Healthcare Platform in India</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Find the Right Therapist & <br className="hidden sm:inline" />
            <span className="text-teal-600">Book an Appointment Online</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Browse qualified clinical psychologists, psychiatrists, and licensed therapists. Select your specialist, view open calendar slots, and book your consultation in minutes.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a href="#therapists">
              <Button size="lg" icon={Calendar}>
                Browse All Therapists
              </Button>
            </a>
            <Link to="/register">
              <Button variant="outline" size="lg" icon={ArrowRight}>
                Join as a Therapist
              </Button>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 flex flex-wrap justify-center items-center gap-6 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified & Licensed Clinicians
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              Real-Time Calendar Slots
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Instant 18% GST Receipts (SAC 999312)
            </span>
          </div>
        </div>
      </section>

      {/* Available Therapists Marketplace Section */}
      <section id="therapists" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-100/60 px-3 py-1 rounded-full">
                Choose a Clinician
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Available Therapists for Booking
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Select any therapist to check their profile, available consultation dates, and reserve a slot.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by name, issue (e.g. CBT, ADHD)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
              />
            </div>
          </div>

          {/* Specialty Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 text-left">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Specialty:</span>
            </span>
            {filterTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                  selectedTag === tag
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Therapists Cards Grid */}
          {loadingTherapists ? (
            <Loader text="Finding available licensed therapists..." />
          ) : filteredTherapists.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
              No therapists match your search criteria. Try choosing "All" specialties.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTherapists.map((therapist) => (
                <div
                  key={therapist._id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-xl hover:border-teal-400 transition-all flex flex-col justify-between text-left group"
                >
                  <div className="space-y-4">
                    {/* Header: Avatar, Name & Title */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={
                            therapist.avatar ||
                            'https://images.unsplash.com/photo-1594824813593-3c94f57c5a92?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={therapist.name}
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-teal-500/20 bg-slate-100"
                        />
                        <span className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full shadow-xs">
                          <ShieldCheck className="w-4 h-4 text-teal-600" />
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition truncate">
                          {therapist.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                          {therapist.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-600">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-teal-600" />
                            {therapist.years_of_experience || 5}+ yrs exp
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium">
                            <Globe className="w-3 h-3 text-teal-600" />
                            {therapist.languages?.[0] || 'English'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Qualifications tag */}
                    {therapist.qualifications && therapist.qualifications.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                        <Award className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{therapist.qualifications[0]}</span>
                      </div>
                    )}

                    {/* Bio excerpt */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {therapist.bio}
                    </p>

                    {/* Specializations Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {therapist.specializations?.slice(0, 3).map((spec, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                      {therapist.specializations?.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-medium self-center">
                          +{therapist.specializations.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Session Fee</span>
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{therapist.hourly_rate?.toLocaleString('en-IN') || 1500}
                      </span>
                      <span className="text-[10px] text-slate-500"> / 60 min</span>
                    </div>

                    <Link to={`/${therapist.slug}`}>
                      <Button size="sm" icon={Calendar}>
                        Book Slot
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How Client Booking Works */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">
              Seamless Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How Booking Works for Clients
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Three simple steps to connect with professional mental healthcare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900">Select Your Therapist</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare verified clinical psychologists, psychiatrists, and counselors by specialty, experience, and fee.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900">Choose Open Slot</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pick an available date and time from the therapist's live calendar. Automatic double-booking protection.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900">Instant Confirmation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Secure checkout with Razorpay. Instantly receive your video meeting link and 18% GST tax receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Indian Clinical & Confidentiality Standards
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Built to meet clinical data protection and GST compliance standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-3"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{feature.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="bg-slate-900 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Are you a Mental Health Professional?</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Get your own branded practice link, calendar scheduling, SOAP clinical notes, and automated GST billing.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/register">
              <Button size="md">Create Free Practice</Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="md"
                className="bg-transparent text-white border-slate-700 hover:bg-slate-800"
              >
                Therapist Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
