const express = require("express");
const router = express.Router();

const {
  getAllEmissionFactors,
  getEmissionFactorById,
  createEmissionFactor,
  updateEmissionFactor,
  deactivateEmissionFactor
} = require("./environmental.controller");

router.get("/emission-factors", getAllEmissionFactors);

router.get(
  "/emission-factors/:factorId",
  getEmissionFactorById
);

router.post(
  "/emission-factors",
  createEmissionFactor
);

router.put(
  "/emission-factors/:factorId",
  updateEmissionFactor
);

router.delete(
  "/emission-factors/:factorId",
  deactivateEmissionFactor
);

module.exports = router;