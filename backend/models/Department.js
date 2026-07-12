const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    department_id: {
      type: String,
      required: true,
      unique: true
    },

    department_name: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Department",
  departmentSchema,
  "departments"
);