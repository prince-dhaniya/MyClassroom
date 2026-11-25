const mongoose = require('mongoose');

const ParticipantSubSchema = new mongoose.Schema(
  {
    socketId: { type: String, required: true },
    participantName: { type: String, required: true },
    language: { type: String, default: 'en' },
    joinedAt: { type: Number, default: Date.now }
  },
  { _id: false }
);

const RoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      default: 'Classroom Lecture Room'
    },
    activeParticipants: [ParticipantSubSchema],
    totalCaptionsCount: {
      type: Number,
      default: 0
    },
    sessionStart: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound Index for room query optimization
RoomSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model('Room', RoomSchema);
