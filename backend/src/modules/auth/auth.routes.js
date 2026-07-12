const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const { register, login, getMe } = require('./auth.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);

module.exports = router;
