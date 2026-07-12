const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['CSR_ACTIVITY', 'CHALLENGE'], required: true },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
