const mongoose = require('mongoose');

const environmentalGoalSchema = new mongoose.Schema(
  {
    goal_id: {
      type: String,
      required: [true, 'Goal ID is required'],
      unique: true,
      trim: true
    },

    goal_name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true
    },

    goal_type: {
      type: String,
      enum: ['REDUCTION', 'EFFICIENCY', 'RENEWABLE', 'WASTE', 'OTHER'],
      default: 'REDUCTION'
    },

    department_id: {
      type: String,
      required: [true, 'Department ID is required']
    },

    target_reduction: {
      type: Number,
      default: 0,
      min: [0, 'Target reduction cannot be negative']
    },

    baseline_emission_kg_co2e: {
      type: Number,
      required: [true, 'Baseline emission is required'],
      min: [0, 'Baseline emission cannot be negative']
    },

    target_emission_kg_co2e: {
      type: Number,
      required: [true, 'Target emission is required'],
      min: [0, 'Target emission cannot be negative']
    },

    start_date: {
      type: Date,
      required: [true, 'Start date is required']
    },

    end_date: {
      type: Date,
      required: [true, 'End date is required']
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'ACHIEVED', 'NOT_ACHIEVED'],
      default: 'ACTIVE'
    },

    description: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.EnvironmentalGoal ||
  mongoose.model('EnvironmentalGoal', environmentalGoalSchema, 'environmentalGoals');
