const mongoose = require('mongoose');

// TODO (Person 1): Define EmissionFactor schema
// Fields: name (String, required), unit (String, required), factorValue (Number, required), source (String)

const emissionFactorSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('EmissionFactor', emissionFactorSchema);
