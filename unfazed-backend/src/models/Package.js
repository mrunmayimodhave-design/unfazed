const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
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
    session_count: {
      type: Number,
      required: true,
      enum: [3, 6, 12],
    },
    total_price: {
      type: Number,
      required: true,
    },
    per_session_rate: {
      type: Number,
      required: true,
    },
    discount_percent: {
      type: Number,
      default: 10,
    },
    validity_days: {
      type: Number,
      default: 90,
    },
    description: {
      type: String,
      default: '',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Package', packageSchema);
