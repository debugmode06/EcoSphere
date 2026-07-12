const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const { register, login, getMe, getEmployees } = require('./auth.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.get('/employees', verifyToken, getEmployees);

module.exports = router;
