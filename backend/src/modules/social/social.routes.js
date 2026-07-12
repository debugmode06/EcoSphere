const express = require('express');
const router = express.Router();

const categoryRoutes = require('./routes/categoryRoutes');
const csrRoutes = require('./routes/csrRoutes');
const participationRoutes = require('./routes/participationRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const reportRoutes = require('./routes/reportRoutes');

router.use('/categories', categoryRoutes);
router.use('/csr-activities', csrRoutes);
router.use('/participations', participationRoutes);
router.use('/training', trainingRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
