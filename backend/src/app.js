const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// Mongoose model registration
require('./modules/auth/models/Employee.model');
require('./modules/core/models/Department.model');
require('./modules/core/models/Category.model');
require('./modules/core/models/DepartmentScore.model');
require('./modules/environmental/models/EmissionFactor.model');
require('./modules/environmental/models/CarbonTransaction.model');
require('./modules/environmental/models/EnvironmentalGoal.model');
require('./modules/social/models/CsrActivity.model');
require('./modules/social/models/EmployeeParticipation.model');
require('./modules/social/models/Training');
require('./modules/social/models/TrainingCompletion');
require('./modules/governance/models/EsgPolicy.model');
require('./modules/governance/models/PolicyAcknowledgement.model');
require('./modules/governance/models/Audit.model');
require('./modules/governance/models/ComplianceIssue.model');
require('./modules/gamification/models/Challenge.model');
require('./modules/gamification/models/ChallengeParticipation.model');
require('./modules/gamification/models/Badge.model');
require('./modules/gamification/models/Reward.model');

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
