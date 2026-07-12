const mongoose = require('mongoose');

// TODO (Person 3): Define Audit schema
// Fields: title (required), department (ref), date (required), findings (String), status (default 'Scheduled')

const auditSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Audit', auditSchema);
