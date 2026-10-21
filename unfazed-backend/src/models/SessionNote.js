const mongoose = require('mongoose');

const sessionNoteSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['private', 'shared'],
      required: [true, 'Note type (private or shared) is strictly required'],
      default: 'private',
      index: true,
    },
    format: {
      type: String,
      enum: ['freeform', 'soap', 'dap'],
      default: 'freeform',
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
    },
    content: {
      type: String, // Rich-text HTML content from TipTap
      default: '',
    },
    soapData: {
      subjective: { type: String, default: '' },
      objective: { type: String, default: '' },
      assessment: { type: String, default: '' },
      plan: { type: String, default: '' },
    },
    dapData: {
      data: { type: String, default: '' },
      assessment: { type: String, default: '' },
      plan: { type: String, default: '' },
    },
    tags: {
      type: [String],
      default: [],
    },
    is_pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Method for secure client serialization — guarantees private notes can NEVER leak to clients
sessionNoteSchema.methods.toClientJSON = function () {
  if (this.type === 'private') {
    return null;
  }
  return {
    _id: this._id,
    session_id: this.session_id,
    title: this.title,
    content: this.content,
    createdAt: this.createdAt,
    type: 'shared',
  };
};

module.exports = mongoose.model('SessionNote', sessionNoteSchema);
