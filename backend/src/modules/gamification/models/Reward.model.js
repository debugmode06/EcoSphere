const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  pointsRequired: { type: Number, required: true },
  stock: { type: Number, required: true },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Reward', rewardSchema);
