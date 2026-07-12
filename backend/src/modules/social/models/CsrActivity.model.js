const mongoose = require('mongoose');

// TODO (Person 2): Define CsrActivity schema
// Fields: title (required), category (ref), description, department (ref), date (required),
//         status (default 'Planned'), evidenceRequired (Boolean), pointsOnCompletion (Number)

const csrActivitySchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('CsrActivity', csrActivitySchema);
