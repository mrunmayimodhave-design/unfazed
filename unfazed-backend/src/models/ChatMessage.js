const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
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
    sender_type: {
      type: String,
      enum: ['therapist', 'client'],
      required: true,
    },
    sender_name: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    read_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ therapist_id: 1, client_id: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
