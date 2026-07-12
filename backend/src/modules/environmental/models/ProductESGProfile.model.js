const mongoose = require('mongoose');

const productESGProfileSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: [true, 'Product ID is required'],
      unique: true,
      trim: true
    },
    product_name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    material: {
      type: String,
      trim: true
    },
    supplier: {
      type: String,
      trim: true
    },
    carbon_footprint: {
      type: Number,
      default: 0,
      min: [0, 'Carbon footprint cannot be negative']
    },
    water_consumption: {
      type: Number,
      default: 0,
      min: [0, 'Water consumption cannot be negative']
    },
    energy_consumption: {
      type: Number,
      default: 0,
      min: [0, 'Energy consumption cannot be negative']
    },
    recyclable_percentage: {
      type: Number,
      default: 0,
      min: [0, 'Recyclable percentage cannot be negative'],
      max: [100, 'Recyclable percentage cannot exceed 100']
    },
    lifecycle_score: {
      type: Number,
      default: 0,
      min: [0, 'Lifecycle score cannot be negative'],
      max: [100, 'Lifecycle score cannot exceed 100']
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ProductESGProfile ||
  mongoose.model('ProductESGProfile', productESGProfileSchema, 'productESGProfiles');
