<<<<<<< HEAD
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('./models/Employee.model');
const Department = require('../core/models/Department.model');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, departmentId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }

  const existing = await Employee.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  // Resolve department: use provided or fallback to first dept
  let dept = null;
  if (departmentId) {
    dept = await Department.findById(departmentId);
  } else {
    dept = await Department.findOne();
  }
  if (!dept) {
    return res.status(400).json({ message: 'No department found. Run seed first.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const employee = await Employee.create({
    name,
    email,
    passwordHash,
    role: role || 'EMPLOYEE',
    department: dept._id,
  });

  const token = jwt.sign(
    { id: employee._id, role: employee.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    employee: {
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
    },
  });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const employee = await Employee.findOne({ email }).select('+passwordHash');
  if (!employee) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, employee.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: employee._id, role: employee.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    employee: {
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
    },
  });
});

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.user._id).populate('department', 'name code');
  res.json({ employee });
});

module.exports = { register, login, getMe };
=======
const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const employee = await authService.register(req.body);
  res.status(201).json({
    message: 'Registered successfully',
    employee: {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json({
    message: 'Logged in successfully',
    token: result.token,
    employee: result.employee
  });
});

const getMe = asyncHandler(async (req, res) => {
  const employee = await authService.getMe(req.user._id);
  res.status(200).json(employee);
});

module.exports = {
  register,
  login,
  getMe
};
>>>>>>> gamification-rbac-fix
