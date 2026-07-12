const mongoose = require('mongoose');

// TODO (Person 4): Define DepartmentScore schema
// Fields: department (ref, unique), environmentalScore, socialScore, governanceScore, totalScore
// One document per department — updated by scoringEngine.js

const departmentScoreSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('DepartmentScore', departmentScoreSchema);
