const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: [true, 'Password is required'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      default: 'Licensed Clinical Psychologist',
    },
    bio: {
      type: String,
      default: 'Experienced mental health professional dedicated to helping clients navigate anxiety, relationships, and personal growth.',
    },
    specializations: {
      type: [String],
      default: ['Cognitive Behavioral Therapy (CBT)', 'Mindfulness', 'Stress & Anxiety'],
    },
    languages: {
      type: [String],
      default: ['English', 'Hindi'],
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    hourly_rate: {
      type: Number,
      default: 1500, // in INR
    },
    currency: {
      type: String,
      default: 'INR',
    },
    avatar: {
      type: String,
      default: '',
    },
    cover_image: {
      type: String,
      default: '',
    },
    qualifications: {
      type: [String],
      default: ['M.Phil in Clinical Psychology', 'RCI Registered'],
    },
    years_of_experience: {
      type: Number,
      default: 6,
    },
    subscription_tier: {
      type: String,
      default: 'free', // 'free', 'pro', 'enterprise'
    },
    tier_expiry: {
      type: Date,
      default: null,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    buffer_time_minutes: {
      type: Number,
      default: 15,
    },
    session_durations: {
      type: [Number],
      default: [30, 45, 60],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Therapist', therapistSchema);
