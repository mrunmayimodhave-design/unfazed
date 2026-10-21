import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Settings, Save, Check } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import CalendarView from '../../components/scheduling/Calendar';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const Schedule = () => {
  const [sessions, setSessions] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'availability'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, availRes] = await Promise.all([
          axiosInstance.get('/scheduling/sessions'),
          axiosInstance.get('/scheduling/availability'),
        ]);

        if (sessionsRes.data.success) {
          setSessions(sessionsRes.data.sessions || []);
        }
        if (availRes.data.success) {
          setAvailability(availRes.data.availability);
        }
      } catch (err) {
        console.error('Error fetching schedule data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (sessionId, newStatus) => {
    try {
      await axiosInstance.put(`/scheduling/sessions/${sessionId}/status`, { status: newStatus });
      setSessions((prev) =>
        prev.map((s) => (s._id === sessionId ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDayToggle = (dayIndex) => {
    setAvailability((prev) => {
      const updated = [...prev.weekly_schedule];
      updated[dayIndex].enabled = !updated[dayIndex].enabled;
      if (updated[dayIndex].enabled && updated[dayIndex].slots.length === 0) {
        updated[dayIndex].slots = [{ startTime: '09:00', endTime: '17:00' }];
      }
      return { ...prev, weekly_schedule: updated };
    });
  };

  const handleSlotTimeChange = (dayIndex, slotIndex, field, value) => {
    setAvailability((prev) => {
      const updated = [...prev.weekly_schedule];
      updated[dayIndex].slots[slotIndex][field] = value;
      return { ...prev, weekly_schedule: updated };
    });
  };

  const handleSaveAvailability = async () => {
    setSavingSchedule(true);
    setSaveSuccess(false);
    try {
      const res = await axiosInstance.put('/scheduling/availability', {
        weekly_schedule: availability.weekly_schedule,
        buffer_time_minutes: availability.buffer_time_minutes,
        session_durations: availability.session_durations,
        timezone: availability.timezone,
      });
      if (res.data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Error saving availability schedule:', err);
    } finally {
      setSavingSchedule(false);
    }
  };

  if (loading) {
    return <Loader text="Loading schedule and availability..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Scheduling & Availability</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure your recurring weekly slots, session buffer times, and manage bookings.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'calendar' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Booked Sessions ({sessions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'availability' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Weekly Availability Rules</span>
          </button>
        </div>
      </div>

      {activeTab === 'calendar' ? (
        <CalendarView sessions={sessions} onStatusChange={handleStatusChange} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Weekly Schedule Template</h3>
              <p className="text-xs text-slate-500">
                Clients can only book within active time windows. Open slots auto-calculate based on buffer time.
              </p>
            </div>

            <Button
              icon={Save}
              isLoading={savingSchedule}
              onClick={handleSaveAvailability}
            >
              {saveSuccess ? 'Changes Saved!' : 'Save Weekly Schedule'}
            </Button>
          </div>

          {/* Buffer & Durations Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Buffer Time Between Sessions (Minutes)
              </label>
              <select
                value={availability?.buffer_time_minutes || 15}
                onChange={(e) =>
                  setAvailability({ ...availability, buffer_time_minutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-teal-500"
              >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes (Recommended)</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Practice Timezone</label>
              <input
                type="text"
                disabled
                value={availability?.timezone || 'Asia/Kolkata (IST)'}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium"
              />
            </div>
          </div>

          {/* Weekly Days List */}
          <div className="space-y-3">
            {availability?.weekly_schedule?.map((day, dayIndex) => (
              <div
                key={day.dayOfWeek}
                className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  day.enabled ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50/70 border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-[140px]">
                  <input
                    type="checkbox"
                    id={`day-${day.dayOfWeek}`}
                    checked={day.enabled}
                    onChange={() => handleDayToggle(dayIndex)}
                    className="w-4 h-4 text-teal-600 rounded-sm border-slate-300 focus:ring-teal-500"
                  />
                  <label
                    htmlFor={`day-${day.dayOfWeek}`}
                    className="font-bold text-sm text-slate-900 cursor-pointer"
                  >
                    {day.dayName}
                  </label>
                </div>

                {day.enabled ? (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {day.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center gap-1.5">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            handleSlotTimeChange(dayIndex, slotIndex, 'startTime', e.target.value)
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-teal-500"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) =>
                            handleSlotTimeChange(dayIndex, slotIndex, 'endTime', e.target.value)
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Day Off (Unavailable)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
