const mongoose = require('mongoose');

const TranscriptEventSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true
    },
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    participantId: {
      type: String,
      default: 'anonymous'
    },
    participantName: {
      type: String,
      required: true,
      index: true
    },
    language: {
      type: String,
      default: 'en',
      index: true
    },
    text: {
      type: String,
      default: ''
    },
    translation: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'speech',
      index: true
    },
    status: {
      type: String,
      enum: ['partial', 'final', 'corrected'],
      default: 'partial',
      index: true
    },
    confidence: {
      type: Number,
      default: 1.0
    },
    timestamp: {
      type: Number,
      required: true,
      index: true
    },
    correctedBy: {
      type: String,
      default: null
    },
    correctedAt: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// ───── HIGH PERFORMANCE INDEXES ─────
// 1. Compound index for ultra-fast room chronological retrieval
TranscriptEventSchema.index({ roomId: 1, timestamp: 1 });

// 2. Compound index for status filtering (e.g. finalized / corrected only)
TranscriptEventSchema.index({ roomId: 1, status: 1 });

// 3. Compound index for speaker timeline queries
TranscriptEventSchema.index({ roomId: 1, participantName: 1, timestamp: 1 });

// 4. Full-Text Search Index across original speech text and Hindi translation
TranscriptEventSchema.index(
  { text: 'text', translation: 'text' },
  { weights: { text: 2, translation: 1 }, name: 'TranscriptTextSearchIndex' }
);

module.exports = mongoose.model('TranscriptEvent', TranscriptEventSchema);
