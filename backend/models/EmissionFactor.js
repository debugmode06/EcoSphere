const mongoose = require("mongoose");

const emissionFactorSchema = new mongoose.Schema({

    factor_id: {
        type: String,
        required: true,
        unique: true
    },

    activity_name: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    unit: {
        type: String,
        required: true
    },

    emission_factor: {
        type: Number,
        required: true
    },

    factor_unit: {
        type: String
    },

    source: {
        type: String
    },

    year: {
        type: Number
    },

    is_active: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.models.EmissionFactor || mongoose.model(
    "EmissionFactor",
    emissionFactorSchema,
    "emissionFactors"
);