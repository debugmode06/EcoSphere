const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  csrActivityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CsrActivity',
    required: true,
  },
  proofDocument: {
    type: String,  // file URL
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  joinedDate: {
    type: Date,
    default: Date.now,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null,
  },
  approvedDate: {
    type: Date,
    default: null,
  },
  remarks: {
    type: String,
    trim: true,
    default: null,
  },
}, { timestamps: true });

// Ensure one participation record per employee per activity
participationSchema.index({ employeeId: 1, csrActivityId: 1 }, { unique: true });

module.exports = mongoose.model('Participation', participationSchema);
