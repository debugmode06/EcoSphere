const mongoose = require('mongoose');

// TODO (Person 3): Define PolicyAcknowledgement schema
// Fields: policy (ref, required), employee (ref, required), acknowledgedDate (default now)
// IMPORTANT: Add compound unique index { policy: 1, employee: 1 } to prevent duplicate acknowledgements

const policyAckSchema = new mongoose.Schema({}, { timestamps: true });

// policyAckSchema.index({ policy: 1, employee: 1 }, { unique: true });

module.exports = mongoose.model('PolicyAcknowledgement', policyAckSchema);
