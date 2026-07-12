const mongoose = require('mongoose');

// TODO (Person 4): Define Badge schema
// Fields: name (required), description, unlockType enum (xp/challengeCount), threshold (required), icon

const badgeSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
