const mongoose = require('mongoose');

// TODO (Person 4): Define Department schema
// Fields: name (required), code (unique, required), head, parentDepartment (self-ref), employeeCount, status

const departmentSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
