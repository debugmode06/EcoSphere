const mongoose = require('mongoose');

// TODO (Person 1): Define EnvironmentalGoal schema
// Fields: title (required), targetValue, currentValue, deadline (Date, required), department (ref, optional)

const environmentalGoalSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.models.EnvironmentalGoal || mongoose.model('EnvironmentalGoal', environmentalGoalSchema);
