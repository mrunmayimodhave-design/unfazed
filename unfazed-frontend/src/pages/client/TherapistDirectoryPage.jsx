import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  ShieldCheck,
  Clock,
  Globe,
  Award,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import axiosInstance from '../../api/axiosInstance';

const TherapistDirectoryPage = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [priceFilter, setPriceFilter] = useState('all');

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
        setLoading(false);
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

    const matchesPrice =
      priceFilter === 'all' ||
      (priceFilter === 'low' && t.hourly_rate <= 1600) ||
      (priceFilter === 'mid' && t.hourly_rate > 1600 && t.hourly_rate <= 2000) ||
      (priceFilter === 'high' && t.hourly_rate > 2000);

    return matchesSearch && matchesTag && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 selection:bg-teal-500 selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-lg space-y-4 text-left relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700/50 text-teal-200 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Verified Mental Health Clinicians in India</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-2xl">
            Choose Your Therapist & Book a Session
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Browse qualified clinical psychologists, psychiatrists, and licensed counselors. Select any clinician to view their calendar, available slots, and book directly.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs text-teal-200 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Verified Clinical Credentials
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-400" />
              Live Real-Time Slot Picker
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-teal-400" />
              Direct Encrypted Video Consultations
            </span>
          </div>
        </div>

        {/* Filter & Search Bar Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-left">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by clinician name, specialty (e.g. CBT, ADHD), or language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs transition"
              />
            </div>

            {/* Price Filter Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Consultation Fee:
              </span>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Rates</option>
                <option value="low">₹1,500 – ₹1,600 / session</option>
                <option value="mid">₹1,700 – ₹2,000 / session</option>
                <option value="high">₹2,000+ / session</option>
              </select>
            </div>
          </div>

          {/* Specialty Filter Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
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
                    : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Therapists Cards Grid */}
        {loading ? (
          <Loader text="Loading available licensed therapists..." />
        ) : filteredTherapists.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center text-slate-500 space-y-3">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Therapists Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No clinicians matched your filter criteria. Try clearing your search query or choosing "All" specialties.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('All');
                setPriceFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-500 px-1">
              <span>
                Showing <strong>{filteredTherapists.length}</strong> available clinicians
              </span>
              <span>Sorted by clinical seniority</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTherapists.map((therapist) => (
                <div
                  key={therapist._id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-xl hover:border-teal-400 transition-all flex flex-col justify-between text-left group"
                >
                  <div className="space-y-4">
                    {/* Header: Photo, Verified Badge, Name, Title */}
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
                            {therapist.languages?.join(', ') || 'English'}
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

                  {/* Pricing & Booking CTA */}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistDirectoryPage;
