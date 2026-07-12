const express = require('express');
const router = express.Router();

const categoryRoutes = require('./routes/categoryRoutes');
const csrRoutes = require('./routes/csrRoutes');
const participationRoutes = require('./routes/participationRoutes');

router.use('/categories', categoryRoutes);
router.use('/csr-activities', csrRoutes);
router.use('/participations', participationRoutes);

module.exports = router;
