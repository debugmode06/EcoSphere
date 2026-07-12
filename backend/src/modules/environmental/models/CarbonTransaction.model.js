const mongoose = require('mongoose');

// TODO (Person 1): Define CarbonTransaction schema
// Fields: department (ref), emissionFactor (ref), quantity, calculatedEmission (auto-computed), source enum, date
// Business rule: calculatedEmission = quantity * emissionFactor.factorValue (computed in service)

const carbonTransactionSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('CarbonTransaction', carbonTransactionSchema);
