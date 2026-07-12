const mongoose = require('mongoose');

const policyAckSchema = new mongoose.Schema(
  {
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EsgPolicy',
      required: [true, 'Policy reference is required'],
      index: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true,
    },
    acknowledgedDate: {
      type: Date,
      default: Date.now,
    },
    feedback: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound unique index — prevents duplicate acknowledgements
policyAckSchema.index({ policy: 1, employee: 1 }, { unique: true });

module.exports = mongoose.model('PolicyAcknowledgement', policyAckSchema);
