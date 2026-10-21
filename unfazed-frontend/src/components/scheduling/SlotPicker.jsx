import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Clock, Calendar as CalendarIcon, Check, AlertCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import Button from '../common/Button';
import Loader from '../common/Loader';

const SlotPicker = ({ therapistSlug, onSelectSlot, selectedSlot }) => {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedTimezone, setSelectedTimezone] = useState('Asia/Kolkata');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Next 14 days dates array
  const dateOptions = Array.from({ length: 14 }).map((_, index) => {
    const d = addDays(new Date(), index);
    return {
      dateStr: format(d, 'yyyy-MM-dd'),
      dayName: format(d, 'EEE'),
      dayNum: format(d, 'd'),
      monthName: format(d, 'MMM'),
    };
  });

  useEffect(() => {
    if (!therapistSlug || !selectedDate) return;

    const fetchSlots = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get(
          `/scheduling/public/${therapistSlug}/slots?date=${selectedDate}&duration=${selectedDuration}`
        );
        if (res.data.success) {
          setSlots(res.data.slots || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load open slots.');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [therapistSlug, selectedDate, selectedDuration]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-teal-600" />
            <span>Select Date & Time</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Times converted automatically to your timezone ({selectedTimezone})
          </p>
        </div>

        {/* Duration selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-slate-500">Duration:</span>
          {[30, 45, 60].map((dur) => (
            <button
              key={dur}
              onClick={() => setSelectedDuration(dur)}
              className={`px-2.5 py-1 rounded-lg font-semibold border transition ${
                selectedDuration === dur
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {dur} min
            </button>
          ))}
        </div>
      </div>

      {/* Date Carousel */}
      <div className="mt-4">
        <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
          Available Dates
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {dateOptions.map((item) => {
            const isSelected = selectedDate === item.dateStr;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                className={`flex flex-col items-center justify-center min-w-[70px] py-2.5 px-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold ring-2 ring-teal-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white text-slate-700'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {item.dayName}
                </span>
                <span className="text-lg font-extrabold my-0.5">{item.dayNum}</span>
                <span className="text-[10px] text-slate-500">{item.monthName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Open Slots Grid */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>Open Slots for {format(new Date(`${selectedDate}T00:00:00`), 'EEEE, MMMM d')}</span>
          </label>
          <span className="text-xs text-slate-400">{slots.length} available</span>
        </div>

        {loading ? (
          <Loader text="Finding open calendar slots..." size="sm" />
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm font-semibold text-slate-700">No open slots on this date</p>
            <p className="text-xs text-slate-500 mt-1">
              Please choose another day or send an inquiry to request an alternate time window.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {slots.map((slot, index) => {
              const isSelected = selectedSlot?.start_time === slot.start_time;
              return (
                <button
                  key={index}
                  onClick={() => onSelectSlot({ ...slot, date: selectedDate })}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20 font-bold scale-[1.02]'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-teal-400 hover:bg-teal-50/50'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{slot.formatted_time}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotPicker;
