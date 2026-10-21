const mongoose = require('mongoose');

const subscriptionTierConfigSchema = new mongoose.Schema(
  {
    tier_name: {
      type: String,
      required: true,
      unique: true,
    },
    tier_key: {
      type: String,
      required: true,
      unique: true,
      enum: ['free', 'starter', 'pro', 'enterprise'],
      lowercase: true,
    },
    price: {
      monthly: { type: Number, default: 0 },
      yearly: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    caps: {
      max_active_clients: {
        type: Number,
        required: true,
        default: 5,
      },
      max_sessions_per_month: {
        type: Number,
        default: 50,
      },
    },
    features: {
      allowed_note_templates: {
        type: [String],
        default: ['freeform'], // 'freeform', 'soap', 'dap'
      },
      analytics_depth: {
        type: String,
        enum: ['basic', 'advanced', 'full'],
        default: 'basic',
      },
      custom_branding: {
        type: Boolean,
        default: false,
      },
      real_time_chat: {
        type: Boolean,
        default: true,
      },
      automated_reminders: {
        type: Boolean,
        default: false,
      },
      gst_invoicing: {
        type: Boolean,
        default: true,
      },
      priority_support: {
        type: Boolean,
        default: false,
      },
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

module.exports = mongoose.model('SubscriptionTierConfig', subscriptionTierConfigSchema);
