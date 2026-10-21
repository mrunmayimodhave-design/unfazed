import React, { useState } from 'react';
import { Shield, CheckCircle2, FileSignature } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import axiosInstance from '../../api/axiosInstance';

const IntakeFormModal = ({ isOpen, onClose, clientId, clientName, onComplete }) => {
  const [formData, setFormData] = useState({
    date_of_birth: '',
    gender: 'Prefer not to say',
    occupation: '',
    presenting_concern: '',
    previous_therapy: '',
    current_medications: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_rel: '',
  });

  const [consentAgreed, setConsentAgreed] = useState(false);
  const [signatureName, setSignatureName] = useState(clientName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentAgreed) {
      setError('Please review and check the informed consent statement.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const intakePayload = {
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        occupation: formData.occupation,
        presenting_concern: formData.presenting_concern,
        previous_therapy: formData.previous_therapy,
        current_medications: formData.current_medications,
        emergency_contact: {
          name: formData.emergency_contact_name,
          phone: formData.emergency_contact_phone,
          relationship: formData.emergency_contact_rel,
        },
      };

      const res = await axiosInstance.post(`/clients/${clientId}/intake`, {
        intakeData: intakePayload,
        consentAgreed: true,
        signatureName,
      });

      if (res.data.success) {
        if (onComplete) onComplete(res.data.consent);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving intake form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Client Intake & Informed Consent"
      subtitle="Auditable electronic intake record with timestamped digital consent."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="e.g. Architect"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Presenting Concerns / Goals for Therapy *
          </label>
          <textarea
            name="presenting_concern"
            required
            rows={3}
            value={formData.presenting_concern}
            onChange={handleChange}
            placeholder="Describe what challenges you are currently experiencing and what you hope to achieve..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Therapy Experience</label>
            <input
              type="text"
              name="previous_therapy"
              value={formData.previous_therapy}
              onChange={handleChange}
              placeholder="e.g. None / CBT in 2023"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Medications (if any)</label>
            <input
              type="text"
              name="current_medications"
              value={formData.current_medications}
              onChange={handleChange}
              placeholder="e.g. None"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="border-t border-slate-100 pt-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Emergency Contact Information
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              name="emergency_contact_name"
              placeholder="Contact Name"
              value={formData.emergency_contact_name}
              onChange={handleChange}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="text"
              name="emergency_contact_rel"
              placeholder="Relationship (e.g. Spouse)"
              value={formData.emergency_contact_rel}
              onChange={handleChange}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="tel"
              name="emergency_contact_phone"
              placeholder="Phone Number"
              value={formData.emergency_contact_phone}
              onChange={handleChange}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Digital Consent Capture Section */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4 text-teal-600" />
            <span>Informed Consent & Confidentiality Agreement</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-h-24 overflow-y-auto pr-1">
            I understand that psychotherapy is a collaborative process and that information shared is confidential except in circumstances involving imminent risk of harm to self or others, child or elder abuse, or court order. I voluntarily consent to participate in psychological counseling and teletherapy with Unfazed.
          </p>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="consent"
              checked={consentAgreed}
              onChange={(e) => setConsentAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-teal-600 rounded-sm border-slate-300 focus:ring-teal-500"
            />
            <label htmlFor="consent" className="text-xs font-semibold text-slate-800 cursor-pointer">
              I have read and voluntarily agree to the informed consent and therapy service terms.
            </label>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <FileSignature className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Type your full legal name as digital signature"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" icon={CheckCircle2} isLoading={loading}>
            Save Intake & Consent
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default IntakeFormModal;
