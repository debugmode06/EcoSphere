const mongoose = require('mongoose');

const complianceIssueSchema = new mongoose.Schema(
  {
    audit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      default: null,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      required: [true, 'Severity is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [5, 'Description must be at least 5 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    owner: {
      type: String,
      required: [true, 'Owner is required — Business Rule: every issue must have an owner'],
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required — Business Rule: every issue must have a due date'],
    },
    resolvedDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['OPEN', 'RESOLVED'],
      default: 'OPEN',
      index: true,
    },
    isOverdue: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
complianceIssueSchema.index({ status: 1, isOverdue: 1 });
complianceIssueSchema.index({ dueDate: 1 });
complianceIssueSchema.index({ severity: 1, status: 1 });
complianceIssueSchema.index({ createdAt: -1 });

/**
 * Business Rule: Auto-detect overdue status before every save.
 * An issue is overdue if it is OPEN and its dueDate is in the past.
 */
complianceIssueSchema.pre('save', function (next) {
  if (this.status === 'OPEN') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.isOverdue = this.dueDate < today;
  } else {
    this.isOverdue = false;
  }
  next();
});

/**
 * Virtual: days overdue (positive integer when overdue, 0 otherwise)
 */
complianceIssueSchema.virtual('daysOverdue').get(function () {
  if (!this.isOverdue) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((today - this.dueDate) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('ComplianceIssue', complianceIssueSchema);
