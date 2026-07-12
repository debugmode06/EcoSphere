const mongoose = require('mongoose');

// TODO (Person 4): Define Category schema
// Fields: name (required), type enum (CSR_ACTIVITY/CHALLENGE), status

const categorySchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
