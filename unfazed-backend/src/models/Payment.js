const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
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
    session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null,
      index: true,
    },
    package_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      default: null,
    },
    gateway_order_id: {
      type: String,
      default: '',
      index: true,
    },
    gateway_payment_id: {
      type: String,
      default: '',
      index: true,
    },
    gateway_transaction_id: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    platform_fee: {
      type: Number,
      default: 0,
    },
    net_amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    payment_method: {
      type: String,
      default: 'razorpay',
    },
    invoice_number: {
      type: String,
      default: '',
      index: true,
    },
    invoice_path: {
      type: String,
      default: '',
    },
    tax_details: {
      gst_rate: { type: Number, default: 18 }, // 18% GST
      gst_amount: { type: Number, default: 0 },
      is_gst_applicable: { type: Boolean, default: true },
    },
    webhook_verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
