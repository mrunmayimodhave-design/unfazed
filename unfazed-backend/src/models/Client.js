const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    therapist_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Client email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'lead', 'archived'],
      default: 'active',
      index: true,
    },
    tags: {
      type: [String],
      default: ['New Client'],
    },
    intakeData: {
      date_of_birth: { type: String, default: '' },
      gender: { type: String, default: '' },
      occupation: { type: String, default: '' },
      presenting_concern: { type: String, default: '' },
      previous_therapy: { type: String, default: '' },
      current_medications: { type: String, default: '' },
      emergency_contact: {
        name: { type: String, default: '' },
        relationship: { type: String, default: '' },
        phone: { type: String, default: '' },
      },
      preferred_communication: {
        type: String,
        default: 'Email',
      },
    },
    consent: {
      agreed: { type: Boolean, default: false },
      timestamp: { type: Date, default: null },
      ipAddress: { type: String, default: '' },
      terms_version: { type: String, default: 'v1.0' },
      signature_name: { type: String, default: '' },
    },
    custom_fields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    last_session_at: {
      type: Date,
      default: null,
    },
    total_sessions_completed: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index to guarantee client uniqueness per therapist
clientSchema.index({ therapist_id: 1, email: 1 });

module.exports = mongoose.model('Client', clientSchema);
