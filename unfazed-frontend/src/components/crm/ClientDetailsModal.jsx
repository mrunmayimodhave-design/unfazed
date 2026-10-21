import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  User,
  Calendar,
  CreditCard,
  FileText,
  ShieldCheck,
  Plus,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loader from '../common/Loader';
import axiosInstance from '../../api/axiosInstance';
import { Link } from 'react-router-dom';

const ClientDetailsModal = ({ isOpen, onClose, clientId, onAddNoteClick }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'payments' | 'notes' | 'intake'

  useEffect(() => {
    if (!clientId || !isOpen) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/clients/${clientId}`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching client details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [clientId, isOpen]);

  if (!isOpen) return null;

  const client = data?.client || {};
  const sessions = data?.sessions || [];
  const payments = data?.payments || [];
  const notes = data?.notes || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client.name ? `${client.name}'s Clinical Record` : 'Client Profile'}
      subtitle={client.email}
      maxWidth="max-w-3xl"
    >
      {loading ? (
        <Loader text="Aggregating client record history..." />
      ) : (
        <div className="space-y-5">
          {/* Top Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                {client.name?.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{client.name}</h4>
                <p className="text-xs text-slate-500">{client.phone || client.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {client.status?.toUpperCase()}
                  </span>
                  {client.consent?.agreed && (
                    <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Consent Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Link
                to={`/portal/${client._id}`}
                target="_blank"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <span>Client Portal View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'sessions'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Sessions ({sessions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'notes'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Clinical Notes ({notes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'payments'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Billing & Payments ({payments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('intake')}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'intake'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Intake & Consent</span>
            </button>
          </div>

          {/* Tab 1: Sessions */}
          {activeTab === 'sessions' && (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No sessions recorded yet.</p>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s._id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {format(new Date(s.start_time), 'EEEE, MMMM d, yyyy • hh:mm a')}
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        Duration: {s.duration_minutes} min • Type: {s.session_type}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                      {s.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-500">Therapist eyes only (private & shared)</span>
                <Button size="sm" icon={Plus} onClick={() => onAddNoteClick(client)}>
                  New Clinical Note
                </Button>
              </div>

              {notes.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No clinical notes recorded yet.</p>
              ) : (
                notes.map((n) => (
                  <div
                    key={n._id}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 text-xs text-left"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900">{n.title}</h5>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          n.type === 'private'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {n.type === 'private' ? '🔒 Private Note' : '🌐 Shared with Client'}
                      </span>
                    </div>

                    {/* SOAP details if present */}
                    {n.soapData?.subjective && (
                      <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-50 p-2.5 rounded-lg text-[11px]">
                        <div>
                          <strong>S:</strong> {n.soapData.subjective}
                        </div>
                        <div>
                          <strong>O:</strong> {n.soapData.objective}
                        </div>
                        <div>
                          <strong>A:</strong> {n.soapData.assessment}
                        </div>
                        <div>
                          <strong>P:</strong> {n.soapData.plan}
                        </div>
                      </div>
                    )}

                    {n.content && (
                      <div
                        className="text-slate-600 prose prose-xs"
                        dangerouslySetInnerHTML={{ __html: n.content }}
                      />
                    )}

                    <p className="text-[10px] text-slate-400 mt-1">
                      {format(new Date(n.createdAt), 'MMM d, yyyy • hh:mm a')} • Format: {n.format?.toUpperCase()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Payments */}
          {activeTab === 'payments' && (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {payments.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No payment transactions recorded.</p>
              ) : (
                payments.map((p) => (
                  <div
                    key={p._id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">₹{p.amount?.toLocaleString('en-IN')}</p>
                      <p className="text-slate-500 mt-0.5">
                        Invoice: {p.invoice_number} • {format(new Date(p.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 capitalize">
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Intake */}
          {activeTab === 'intake' && (
            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Presenting Concern</p>
                <p className="text-slate-800 font-medium mt-0.5">
                  {client.intakeData?.presenting_concern || 'Not provided'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Occupation</p>
                  <p className="text-slate-800 mt-0.5">{client.intakeData?.occupation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Previous Therapy</p>
                  <p className="text-slate-800 mt-0.5">{client.intakeData?.previous_therapy || 'None'}</p>
                </div>
              </div>
              {client.consent?.agreed && (
                <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-teal-800 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>
                    Digitally signed by <strong>{client.consent.signature_name}</strong> on{' '}
                    {format(new Date(client.consent.timestamp), 'PPpp')} (IP: {client.consent.ipAddress})
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ClientDetailsModal;
