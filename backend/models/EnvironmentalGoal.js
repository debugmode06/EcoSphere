const mongoose = require("mongoose");

const environmentalGoalSchema = new mongoose.Schema(
  {
    goal_id: {
      type: String,
      required: true,
      unique: true
    },

    department_id: {
      type: String,
      required: true
    },

    goal_name: {
      type: String,
      required: true
    },

    start_date: {
      type: Date,
      required: true
    },

    end_date: {
      type: Date,
      required: true
    },

    baseline_emission_kg_co2e: {
      type: Number,
      required: true
    },

    target_emission_kg_co2e: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["ACTIVE", "ACHIEVED", "NOT_ACHIEVED"],
      default: "ACTIVE"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "EnvironmentalGoal",
  environmentalGoalSchema,
  "environmentalGoals"
);