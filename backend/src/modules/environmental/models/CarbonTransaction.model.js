const mongoose = require('mongoose');

const carbonTransactionSchema = new mongoose.Schema({
  emissionFactor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmissionFactor",
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  carbonEmission: {
    type: Number,
    required: true
  },

  department: {
    type: String
  },

  description: {
    type: String
  },

  transactionDate: {
    type: Date,
    default: Date.now
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
}, {
  timestamps: true
});

module.exports =
  mongoose.models.CarbonTransaction ||
  mongoose.model(
    "CarbonTransaction",
    carbonTransactionSchema,
    "carbonTransactions"
  );
