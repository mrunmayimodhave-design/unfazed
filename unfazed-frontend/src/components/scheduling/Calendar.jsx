import React from 'react';
import { format } from 'date-fns';
import { Video, User, CheckCircle2, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import Button from '../common/Button';

const CalendarView = ({ sessions, onStatusChange }) => {
  const statusBadges = {
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    scheduled: 'bg-teal-50 text-teal-700 border-teal-200',
    completed: 'bg-slate-100 text-slate-700 border-slate-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    no_show: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Practice Sessions</h3>
          <p className="text-xs text-slate-500">Upcoming and past clinical consultations</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg">
          {sessions.length} Total Sessions
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <p className="font-medium text-slate-700">No sessions booked yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Share your branded public link with clients to start receiving bookings.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {sessions.map((session) => {
            const client = session.client_id || {};
            const startTime = new Date(session.start_time);

            return (
              <div
                key={session._id}
                className="p-5 hover:bg-slate-50/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Date & Time Column */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 border border-teal-100 shrink-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {format(startTime, 'MMM')}
                    </span>
                    <span className="text-xl font-extrabold leading-none my-0.5">
                      {format(startTime, 'd')}
                    </span>
                    <span className="text-[10px] text-teal-600 font-medium">
                      {format(startTime, 'EEE')}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {format(startTime, 'hh:mm a')}
                      </span>
                      <span className="text-xs text-slate-400">• {session.duration_minutes} min</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          statusBadges[session.status] || statusBadges.scheduled
                        }`}
                      >
                        {session.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">{client.name || 'Client'}</span>
                      <span className="text-slate-400">({client.email})</span>
                    </div>

                    {session.meeting_link && session.status !== 'cancelled' && (
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-semibold mt-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Session Video</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {session.status !== 'completed' && session.status !== 'cancelled' && (
                    <>
                      <button
                        onClick={() => onStatusChange(session._id, 'completed')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
                        title="Mark session as completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>

                      <button
                        onClick={() => onStatusChange(session._id, 'no_show')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition border border-amber-200"
                        title="Mark as client no-show"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>No-Show</span>
                      </button>

                      <button
                        onClick={() => onStatusChange(session._id, 'cancelled')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition border border-rose-200"
                        title="Cancel session"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
