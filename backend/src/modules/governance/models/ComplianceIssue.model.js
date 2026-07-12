const mongoose = require('mongoose');

// TODO (Person 3): Define ComplianceIssue schema
// Fields: audit (ref), severity enum (Low/Medium/High/Critical), description (required),
//         owner (required), dueDate (required), status enum (OPEN/RESOLVED), isOverdue (Boolean)
// Business rule: if status === 'OPEN' && dueDate < now → set isOverdue = true (on read or cron)

const complianceIssueSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('ComplianceIssue', complianceIssueSchema);
