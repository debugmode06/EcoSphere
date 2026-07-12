const mongoose = require('mongoose');

// TODO: Define Employee schema
// Fields: name, email, passwordHash, role (ADMIN/MANAGER/EMPLOYEE), department (ref), xp, points, badges[]

const employeeSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
