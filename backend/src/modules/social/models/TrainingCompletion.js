const mongoose = require('mongoose');

const trainingCompletionSchema = new mongoose.Schema({
  trainingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Training',
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  status: {
    type: String,
    enum: ['assigned', 'completed', 'not started'],
    default: 'assigned',
  },
  completionDate: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Ensure unique assignment per employee per training
trainingCompletionSchema.index({ trainingId: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model('TrainingCompletion', trainingCompletionSchema);
