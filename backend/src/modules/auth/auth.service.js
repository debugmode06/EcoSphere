const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('./models/Employee.model');

async function register(data) {
  const { name, email, password, role, department } = data;
  const existing = await Employee.findOne({ email });
  if (existing) throw new Error('Email already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  const employee = await Employee.create({
    name,
    email,
    passwordHash,
    role: role || 'EMPLOYEE',
    department
  });
  return employee;
}

async function login(email, password) {
  const employee = await Employee.findOne({ email }).populate('department').populate('badges');
  if (!employee) throw new Error('Invalid email or password');

  const isMatch = await bcrypt.compare(password, employee.passwordHash);
  if (!isMatch) throw new Error('Invalid email or password');

  const deptId = employee.department?._id || employee.department;
  const token = jwt.sign(
    { id: employee._id, role: employee.role, department: deptId },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return { token, employee };
}

async function getMe(id) {
  // Populate badges and redemptions (including the reward details)
  return await Employee.findById(id)
    .select('-passwordHash')
    .populate('department')
    .populate('badges')
    .populate({
      path: 'redemptions.reward',
      model: 'Reward'
    });
}

module.exports = {
  register,
  login,
  getMe
};
