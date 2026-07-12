const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  description: String,
  xp: { type: Number, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  evidenceRequired: { type: Boolean, default: false },
  deadline: Date,
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED'], default: 'DRAFT' }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
