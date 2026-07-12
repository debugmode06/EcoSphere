const EmissionFactor = require("../../../models/EmissionFactor");

// GET all
const getAllEmissionFactors = async (req, res, next) => {
  try {
    const factors = await EmissionFactor.find().sort({ activity_name: 1 });

    res.status(200).json({
      success: true,
      count: factors.length,
      data: factors
    });
  } catch (error) {
    next(error);
  }
};

// GET one
const getEmissionFactorById = async (req, res, next) => {
  try {
    const factor = await EmissionFactor.findOne({
      factor_id: req.params.factorId
    });

    if (!factor) {
      return res.status(404).json({
        success: false,
        message: "Emission factor not found"
      });
    }

    res.status(200).json({
      success: true,
      data: factor
    });
  } catch (error) {
    next(error);
  }
};

// POST
const createEmissionFactor = async (req, res, next) => {
  try {
    const factor = await EmissionFactor.create(req.body);

    res.status(201).json({
      success: true,
      message: "Emission factor created successfully",
      data: factor
    });
  } catch (error) {
    next(error);
  }
};

// PUT
const updateEmissionFactor = async (req, res, next) => {
  try {
    const factor = await EmissionFactor.findOneAndUpdate(
      { factor_id: req.params.factorId },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!factor) {
      return res.status(404).json({
        success: false,
        message: "Emission factor not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Emission factor updated successfully",
      data: factor
    });
  } catch (error) {
    next(error);
  }
};

// DELETE = soft delete
const deactivateEmissionFactor = async (req, res, next) => {
  try {
    const factor = await EmissionFactor.findOneAndUpdate(
      { factor_id: req.params.factorId },
      { is_active: false },
      { new: true }
    );

    if (!factor) {
      return res.status(404).json({
        success: false,
        message: "Emission factor not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Emission factor deactivated successfully",
      data: factor
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmissionFactors,
  getEmissionFactorById,
  createEmissionFactor,
  updateEmissionFactor,
  deactivateEmissionFactor
};