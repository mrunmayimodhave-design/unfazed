const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    therapist_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    preferred_time: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'archived'],
      default: 'new',
      index: true,
    },
    source: {
      type: String,
      default: 'branded_profile',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
