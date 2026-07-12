const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('./models/Employee.model');

/**
 * Register a new employee
 */
async function register({ name, email, password, role, departmentId }) {
  const existingEmployee = await Employee.findOne({ email });
  if (existingEmployee) {
    throw new Error('Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const employee = new Employee({
    name,
    email,
    passwordHash,
    role: role || 'EMPLOYEE',
    department: departmentId || null,
  });

  await employee.save();
  return employee;
}

/**
 * Login an employee and return a token and the user document
 */
async function login({ email, password }) {
  const employee = await Employee.findOne({ email }).populate('department').populate('badges');
  if (!employee) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, employee.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const deptId = employee.department?._id || employee.department;
  const token = jwt.sign(
    { id: employee._id, role: employee.role, department: deptId },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return { token, employee };
}

/**
 * Get profile of current employee
 */
async function getMe(id) {
  return Employee.findById(id)
    .select('-passwordHash')
    .populate('department')
    .populate('badges')
    .populate({
      path: 'redemptions.reward',
      model: 'Reward',
    });
}

module.exports = {
  register,
  login,
  getMe,
};
