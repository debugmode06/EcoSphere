const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Audit title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    date: {
      type: Date,
      required: [true, 'Audit date is required'],
    },
    findings: {
      type: String,
      trim: true,
      maxlength: [5000, 'Findings cannot exceed 5000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Under Review', 'Completed', 'Cancelled'],
      default: 'Scheduled',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for common queries
auditSchema.index({ status: 1, date: 1 });
auditSchema.index({ department: 1, status: 1 });
auditSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Audit', auditSchema);
