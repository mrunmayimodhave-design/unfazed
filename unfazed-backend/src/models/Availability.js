const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "17:00"
  },
  { _id: false }
);

const dayScheduleSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number, // 0 = Sun, 1 = Mon, ..., 6 = Sat
      required: true,
      min: 0,
      max: 6,
    },
    dayName: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    slots: [timeSlotSchema],
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    therapist_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
      unique: true,
      index: true,
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
      default: [30, 45, 60, 90],
    },
    weekly_schedule: {
      type: [dayScheduleSchema],
      default: [
        { dayOfWeek: 0, dayName: 'Sunday', enabled: false, slots: [] },
        { dayOfWeek: 1, dayName: 'Monday', enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
        { dayOfWeek: 2, dayName: 'Tuesday', enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
        { dayOfWeek: 3, dayName: 'Wednesday', enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
        { dayOfWeek: 4, dayName: 'Thursday', enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
        { dayOfWeek: 5, dayName: 'Friday', enabled: true, slots: [{ startTime: '09:00', endTime: '16:00' }] },
        { dayOfWeek: 6, dayName: 'Saturday', enabled: true, slots: [{ startTime: '10:00', endTime: '14:00' }] },
      ],
    },
    overrides: [
      {
        date: { type: String, required: true }, // "YYYY-MM-DD"
        is_available: { type: Boolean, default: true },
        slots: [timeSlotSchema],
        reason: { type: String, default: '' },
      },
    ],
    blocked_slots: [
      {
        start_time: { type: Date, required: true },
        end_time: { type: Date, required: true },
        reason: { type: String, default: 'Personal appointment' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Availability', availabilitySchema);
