const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const environmentalRoutes = require('./modules/environmental/environmental.routes');
const socialRoutes = require('./modules/social/social.routes');
const governanceRoutes = require('./modules/governance/governance.routes');
const gamificationRoutes = require('./modules/gamification/gamification.routes');
const coreRoutes = require('./modules/core/core.routes');

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/environmental', environmentalRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/core', coreRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Error handler (must be last) ───────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
