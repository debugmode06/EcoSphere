const mongoose = require("mongoose");

const productESGProfileSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true,
      unique: true
    },

    product_name: {
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

    emission_factor_id: {
      type: String,
      required: true
    },

    recyclable_percentage: {
      type: Number,
      default: 0
    },

    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "ProductESGProfile",
  productESGProfileSchema,
  "productESGProfiles"
);