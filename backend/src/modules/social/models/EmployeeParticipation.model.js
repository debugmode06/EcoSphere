const mongoose = require('mongoose');

// TODO (Person 2): Define EmployeeParticipation schema
// Fields: employee (ref, required), activity (ref, required), proofUrl, 
//         approvalStatus enum (PENDING/APPROVED/REJECTED), pointsEarned, completionDate
// Business rule: block APPROVED if proofUrl is empty and activity.evidenceRequired is true

const employeeParticipationSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('EmployeeParticipation', employeeParticipationSchema);
