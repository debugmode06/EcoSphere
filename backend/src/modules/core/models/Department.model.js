const mongoose = require('mongoose');

<<<<<<< HEAD
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    head: {
      type: String,
      trim: true,
      default: '',
    },
    parentDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    employeeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);
=======
const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  head: String,
  parentDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  employeeCount: { type: Number, default: 0 },
  status: { type: String, default: 'Active' }
}, { timestamps: true });
>>>>>>> gamification-rbac-fix

module.exports = mongoose.model('Department', departmentSchema);
