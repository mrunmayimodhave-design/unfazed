const mongoose = require('mongoose');

const clientPackageSchema = new mongoose.Schema(
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
    package_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    total_sessions: {
      type: Number,
      required: true,
    },
    remaining_sessions: {
      type: Number,
      required: true,
    },
    purchase_price: {
      type: Number,
      required: true,
    },
    expiry_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'exhausted', 'expired'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClientPackage', clientPackageSchema);
