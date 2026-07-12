const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'], default: 'EMPLOYEE' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  xp: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
  redemptions: [{
    reward: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward' },
    redeemedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
