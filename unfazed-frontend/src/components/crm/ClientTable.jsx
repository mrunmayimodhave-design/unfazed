import React from 'react';
import { format } from 'date-fns';
import { User, Calendar, Tag, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

const ClientTable = ({ clients, onSelectClient, onAddClientClick }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-6">Client Name</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Tags</th>
              <th className="py-3.5 px-4">Last Session</th>
              <th className="py-3.5 px-4 text-center">Sessions</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {clients.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  <p className="font-medium text-slate-700">No clients match the criteria</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Add your first client or adjust your search filter.
                  </p>
                </td>
              </tr>
            ) : (
              clients.map((client) => {
                const statusStyles = {
                  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  inactive: 'bg-slate-100 text-slate-700 border-slate-200',
                  lead: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                };

                return (
                  <tr
                    key={client._id}
                    className="hover:bg-teal-50/30 transition cursor-pointer"
                    onClick={() => onSelectClient(client)}
                  >
                    {/* Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {client.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 hover:text-teal-700 transition">
                            {client.name}
                          </p>
                          {client.consent?.agreed && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-teal-600 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Consent on file</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-4 text-xs text-slate-600">
                      <p className="font-medium text-slate-800">{client.email}</p>
                      <p className="text-slate-400">{client.phone || 'No phone'}</p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                          statusStyles[client.status] || statusStyles.active
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>

                    {/* Tags */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {client.tags?.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {client.tags?.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{client.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Last Session */}
                    <td className="py-4 px-4 text-xs text-slate-600">
                      {client.last_session_at ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{format(new Date(client.last_session_at), 'MMM d, yyyy')}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None yet</span>
                      )}
                    </td>

                    {/* Sessions count */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-slate-800 text-xs bg-slate-100 px-2 py-1 rounded-md">
                        {client.total_sessions_completed || 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClient(client);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-2.5 py-1.5 rounded-lg transition"
                      >
                        <span>View Records</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientTable;
