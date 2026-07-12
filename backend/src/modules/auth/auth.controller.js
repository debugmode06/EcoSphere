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
  const result = await authService.login({ email, password });
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

const getEmployees = asyncHandler(async (req, res) => {
  const employees = await authService.getEmployees();
  res.status(200).json({ employees });
});

module.exports = {
  register,
  login,
  getMe,
  getEmployees
};
