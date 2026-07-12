const mongoose = require('mongoose');

// TODO (Person 3): Define EsgPolicy schema
// Fields: title (required), description, version (default '1.0'), status (default 'Draft'), publishedDate

const esgPolicySchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('EsgPolicy', esgPolicySchema);
