const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  head: String,
  parentDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  employeeCount: { type: Number, default: 0 },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
