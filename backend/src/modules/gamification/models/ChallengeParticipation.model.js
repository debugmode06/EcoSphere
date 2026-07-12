const mongoose = require('mongoose');

const challengeParticipationSchema = new mongoose.Schema({
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  progress: { type: Number, default: 0 },
  proofUrl: String,
  approval: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  xpAwarded: { type: Number, default: 0 }
}, { timestamps: true });

challengeParticipationSchema.index({ challenge: 1, employee: 1 }, { unique: true });

module.exports = mongoose.model('ChallengeParticipation', challengeParticipationSchema);
