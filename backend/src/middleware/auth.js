const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      ...decoded,
      _id: decoded.id
    }; // { id, role, department, _id }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
});

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Requires role: ${roles.join(' or ')}` });
  }
  next();
};

// Manager-scoped check: manager can only act within their own department
const requireOwnDepartmentOrAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'ADMIN') return next();
  if (req.user.role !== 'MANAGER') return res.status(403).json({ message: 'Forbidden' });

  const ChallengeParticipation = require('../modules/gamification/models/ChallengeParticipation.model');

  const participation = await ChallengeParticipation.findById(req.params.id).populate('employee');
  if (!participation) return res.status(404).json({ message: 'Participation not found' });

  if (String(participation.employee.department) !== String(req.user.department)) {
    return res.status(403).json({ message: 'Not your department' });
  }
  next();
});

module.exports = { protect, requireRole, requireOwnDepartmentOrAdmin };
