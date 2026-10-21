const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    therapist_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
      index: true,
    },
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    start_time: {
      type: Date,
      required: true,
      index: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    duration_minutes: {
      type: Number,
      required: true,
      default: 60,
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'confirmed',
      index: true,
    },
    session_type: {
      type: String,
      enum: ['video', 'in_person', 'audio', 'chat'],
      default: 'video',
    },
    meeting_link: {
      type: String,
      default: '',
    },
    fee: {
      type: Number,
      required: true,
      default: 1500,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    payment_status: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'waived'],
      default: 'unpaid',
      index: true,
    },
    client_package_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientPackage',
      default: null,
    },
    cancellation_reason: {
      type: String,
      default: '',
    },
    cancelled_by: {
      type: String,
      enum: ['therapist', 'client', 'system', ''],
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index to accelerate slot overlap queries
sessionSchema.index({ therapist_id: 1, start_time: 1, end_time: 1, status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
