const mongoose = require("mongoose");

const carbonTransactionSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      required: true,
      unique: true
    },

    transaction_date: {
      type: Date,
      required: true
    },

    department_id: {
      type: String,
      required: true
    },

    source_module: {
      type: String,
      enum: ["PURCHASE", "MANUFACTURING", "EXPENSE", "FLEET", "MANUAL"],
      required: true
    },

    emission_factor_id: {
      type: String
    },

    activity_name: {
      type: String,
      required: true
    },

    category: {
      type: String
    },

    quantity: {
      type: Number,
      required: true,
      min: 0
    },

    unit: {
      type: String,
      required: true
    },

    factor_value: {
      type: Number
    },

    calculated_emission_kg_co2e: {
      type: Number,
      required: true
    },

    calculation_mode: {
      type: String,
      enum: ["AUTO", "MANUAL"],
      default: "AUTO"
    },

    reference_number: {
      type: String
    },

    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.CarbonTransaction || mongoose.model(
  "CarbonTransaction",
  carbonTransactionSchema,
  "carbonTransactions"
);