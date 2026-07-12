const mongoose = require('mongoose');

// TODO (Person 4): Define ChallengeParticipation schema
// Fields: challenge (ref, required), employee (ref, required), progress, proofUrl,
//         approval enum (PENDING/APPROVED/REJECTED), xpAwarded
// Business rule: on APPROVED → award xp to employee → check badge thresholds

const challengeParticipationSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('ChallengeParticipation', challengeParticipationSchema);
