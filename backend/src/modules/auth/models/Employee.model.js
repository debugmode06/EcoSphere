const mongoose = require('mongoose');

<<<<<<< HEAD
const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
      default: 'EMPLOYEE',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
      },
    ],
  },
  { timestamps: true }
);
=======
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
>>>>>>> gamification-rbac-fix

module.exports = mongoose.model('Employee', employeeSchema);
