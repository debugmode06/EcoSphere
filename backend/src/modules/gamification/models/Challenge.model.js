const mongoose = require('mongoose');

// TODO (Person 4): Define Challenge schema
// Fields: title (required), category (ref), description, xp (required), difficulty,
//         evidenceRequired, deadline, status enum (DRAFT/ACTIVE/UNDER_REVIEW/COMPLETED/ARCHIVED)

const challengeSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
