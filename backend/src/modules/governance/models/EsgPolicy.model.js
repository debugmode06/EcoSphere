const mongoose = require('mongoose');

const esgPolicySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Policy title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    esgCategory: {
      type: String,
      required: [true, 'ESG Category is required'],
      trim: true,
    },
    effectiveDate: {
      type: Date,
      required: [true, 'Effective date is required'],
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    pdfUrl: {
      type: String,
      trim: true,
      default: '',
    },
    version: {
      type: String,
      default: '1.0',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft',
      index: true,
    },
    publishedDate: {
      type: Date,
      default: null,
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
esgPolicySchema.index({ status: 1, createdAt: -1 });
esgPolicySchema.index({ createdAt: -1 });

// Virtual: set publishedDate when status changes to Published
esgPolicySchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'Published' && !this.publishedDate) {
    this.publishedDate = new Date();
  }
  next();
});

module.exports = mongoose.model('EsgPolicy', esgPolicySchema);
