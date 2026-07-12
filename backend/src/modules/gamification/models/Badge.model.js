const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  unlockType: { type: String, enum: ['xp', 'challengeCount', 'csrCount', 'carbonSaved'], required: true },
  threshold: { type: Number, required: true },
  icon: String
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
