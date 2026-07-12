const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const Employee = require('../modules/auth/models/Employee.model');

/**
 * Middleware: verify JWT token from Authorization header
 */
const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Employee.findById(decoded.id).select('-passwordHash');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

/**
 * Middleware factory: restrict access to specific roles
 * Usage: requireRole('ADMIN', 'MANAGER')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Role ${req.user.role} is not authorised for this action` });
  }
  next();
};

module.exports = { verifyToken, requireRole };
