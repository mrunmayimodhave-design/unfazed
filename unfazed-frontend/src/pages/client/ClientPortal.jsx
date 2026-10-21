import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar,
  CreditCard,
  FileText,
  MessageSquare,
  Video,
  Download,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import ChatWindow from '../../components/chat/ChatWindow';
import IntakeFormModal from '../../components/crm/IntakeFormModal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const ClientPortal = () => {
  const { clientId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'notes' | 'invoices' | 'chat'

  const fetchPortalData = async () => {
    try {
      const res = await axiosInstance.get(`/clients/${clientId}/portal`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to access client portal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchPortalData();
    }
  }, [clientId]);

  const handleDownloadInvoice = (invoiceNumber) => {
    const downloadUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/payments/invoice/${invoiceNumber}/download`;
    window.open(downloadUrl, '_blank');
  };

  if (loading) {
    return <Loader text="Loading your private client portal..." />;
  }

  if (error || !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Client Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">{error || 'Invalid portal access link.'}</p>
        <Link to="/" className="mt-4">
          <Button variant="outline" size="sm">
            Go to Unfazed Home
          </Button>
        </Link>
      </div>
    );
  }

  const { client, therapist, sessions, payments, sharedNotes } = data;
  const hasConsent = client?.consent?.agreed;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-xl shadow-md shadow-teal-600/20">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Welcome, {client.name}
                </h1>
                {hasConsent && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Consent Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Therapy Client Portal • Treating Clinician:{' '}
                <strong className="text-slate-800">{therapist?.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to={`/${therapist?.slug}`} target="_blank">
              <Button variant="outline" size="sm" icon={ExternalLink}>
                Book Next Session
              </Button>
            </Link>
          </div>
        </div>

        {/* Consent prompt if not signed */}
        {!hasConsent && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900">Informed Consent & Intake Required</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Please review and provide digital consent before your upcoming session with {therapist?.name}.
                </p>
              </div>
            </div>
            <Button size="sm" onClick={() => setIntakeModalOpen(true)}>
              Sign Consent Now
            </Button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-bold bg-white px-6 rounded-2xl border">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'sessions'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Sessions ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'notes'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Shared Clinical Notes ({sharedNotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'invoices'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>GST Tax Invoices ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`py-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'chat'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Confidential Chat</span>
          </button>
        </div>

        {/* Tab 1: Sessions */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {sessions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                You have no scheduled sessions yet. Use the "Book Next Session" button to select a time.
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                      {session.session_type} Session
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {format(new Date(session.start_time), 'EEEE, MMMM d, yyyy • hh:mm a')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Duration: {session.duration_minutes} Minutes • Status:{' '}
                      <strong className="text-slate-700 capitalize">{session.status}</strong>
                    </p>
                  </div>

                  {session.meeting_link && session.status !== 'cancelled' && (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-xs font-semibold shadow-md shadow-teal-600/20 transition self-start sm:self-auto"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Video Room</span>
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Shared Notes ONLY */}
        {activeTab === 'notes' && (
          <div className="space-y-4 text-left">
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl text-xs text-teal-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>Confidential Shared Space:</strong> These are therapeutic takeaways, reflection prompts, and exercises shared by {therapist?.name}. Private clinician session records are strictly protected.
              </span>
            </div>

            {sharedNotes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                No shared exercises or session takeaways from {therapist?.name} yet.
              </div>
            ) : (
              sharedNotes.map((note) => (
                <div key={note._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">{note.title}</h3>
                    <span className="text-xs text-slate-400">
                      {format(new Date(note.createdAt), 'MMMM d, yyyy')}
                    </span>
                  </div>
                  <div
                    className="prose prose-sm text-slate-700 max-w-none"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Tax Invoices */}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {payments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No payments recorded yet.
              </div>
            ) : (
              payments.map((p) => (
                <div
                  key={p._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      Invoice #{p.invoice_number}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Date: {format(new Date(p.createdAt), 'MMMM d, yyyy')} • Amount Paid:{' '}
                      <strong className="text-slate-800">₹{p.amount?.toLocaleString('en-IN')}</strong> (18% GST included)
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={() => handleDownloadInvoice(p.invoice_number)}
                  >
                    Download Tax PDF
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Live Real-Time Chat */}
        {activeTab === 'chat' && (
          <ChatWindow
            therapistId={therapist?._id}
            clientId={client._id}
            senderType="client"
            senderName={client.name}
            recipientName={therapist?.name}
          />
        )}

        {/* Intake Modal */}
        <IntakeFormModal
          isOpen={intakeModalOpen}
          onClose={() => setIntakeModalOpen(false)}
          clientId={client._id}
          clientName={client.name}
          onComplete={() => fetchPortalData()}
        />
      </div>
    </div>
  );
};

export default ClientPortal;
