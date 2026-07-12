const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { register, login, getMe } = require('./auth.controller');
const { verifyToken } = require('../../middleware/auth');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me  (protected)
router.get('/me', verifyToken, getMe);
=======
const { protect } = require('../../middleware/auth');
const { register, login, getMe } = require('./auth.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
>>>>>>> gamification-rbac-fix

module.exports = router;
