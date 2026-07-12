const mongoose = require('mongoose');

const csrActivitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 1,
  },
  evidenceRequired: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed'],
    default: 'draft',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('CsrActivity', csrActivitySchema);
