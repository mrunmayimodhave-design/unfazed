import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, ShieldCheck } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import ClientTable from '../../components/crm/ClientTable';
import ClientDetailsModal from '../../components/crm/ClientDetailsModal';
import IntakeFormModal from '../../components/crm/IntakeFormModal';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import useEntitlement from '../../hooks/useEntitlement';

const Clients = () => {
  const { isClientCapReached, promptUpgrade, usage } = useEntitlement();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [intakeClientId, setIntakeClientId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    tags: 'New Client',
    presenting_concern: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const fetchClients = async () => {
    try {
      const res = await axiosInstance.get(
        `/clients?search=${search}&status=${statusFilter}`
      );
      if (res.data.success) {
        setClients(res.data.clients || []);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, statusFilter]);

  const handleAddClientClick = () => {
    if (isClientCapReached()) {
      promptUpgrade(
        'Active Client Capacity',
        `You have reached your limit of ${usage.clientLimit} active clients on this plan. Upgrade to unlock expanded client capacity.`
      );
      return;
    }
    setAddModalOpen(true);
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');

    try {
      const payload = {
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone,
        status: newClientData.status,
        tags: newClientData.tags.split(',').map((t) => t.trim()),
        intakeData: {
          presenting_concern: newClientData.presenting_concern,
        },
      };

      const res = await axiosInstance.post('/clients', payload);
      if (res.data.success) {
        setAddModalOpen(false);
        setNewClientData({
          name: '',
          email: '',
          phone: '',
          status: 'active',
          tags: 'New Client',
          presenting_concern: '',
        });
        fetchClients();
      }
    } catch (err) {
      if (err.response?.data?.upgradeRequired) {
        setAddModalOpen(false);
        promptUpgrade('Client Capacity', err.response?.data?.message);
      } else {
        setAddError(err.response?.data?.message || 'Error creating client.');
      }
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Client CRM & Records</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your patient roster, clinical histories, and auditable digital intake consent.
          </p>
        </div>

        <Button icon={Plus} onClick={handleAddClientClick}>
          Add New Client
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by client name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-600">Status:</span>
          {['all', 'active', 'lead', 'inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      {loading ? (
        <Loader text="Loading client roster..." />
      ) : (
        <ClientTable
          clients={clients}
          onSelectClient={(client) => setSelectedClientId(client._id)}
          onAddClientClick={handleAddClientClick}
        />
      )}

      {/* Aggregate Details Modal */}
      {selectedClientId && (
        <ClientDetailsModal
          isOpen={!!selectedClientId}
          onClose={() => setSelectedClientId(null)}
          clientId={selectedClientId}
          onAddNoteClick={() => {
            // Navigate or launch note creator
          }}
        />
      )}

      {/* Intake / Consent Modal */}
      {intakeClientId && (
        <IntakeFormModal
          isOpen={!!intakeClientId}
          onClose={() => setIntakeClientId(null)}
          clientId={intakeClientId}
          onComplete={() => fetchClients()}
        />
      )}

      {/* Add Client Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Client to Practice"
        subtitle="Record intake demographics and contact info"
      >
        <form onSubmit={handleCreateClient} className="space-y-4 text-left">
          {addError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {addError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Meera Nambiar"
              value={newClientData.name}
              onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="meera@example.com"
                value={newClientData.email}
                onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                placeholder="+91 98765 00000"
                value={newClientData.phone}
                onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
              <select
                value={newClientData.status}
                onChange={(e) => setNewClientData({ ...newClientData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="active">Active Client</option>
                <option value="lead">Prospective Lead</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="CBT, Anxiety, Weekly"
                value={newClientData.tags}
                onChange={(e) => setNewClientData({ ...newClientData, tags: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Presenting Concern</label>
            <textarea
              rows={2}
              placeholder="Brief summary of therapeutic goals or symptoms..."
              value={newClientData.presenting_concern}
              onChange={(e) => setNewClientData({ ...newClientData, presenting_concern: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={addLoading}>
              Save Client
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clients;
