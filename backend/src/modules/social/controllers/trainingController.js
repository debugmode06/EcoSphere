const trainingService = require('../services/trainingService');
const asyncHandler = require('../../../utils/asyncHandler');

const createTraining = asyncHandler(async (req, res) => {
  const training = await trainingService.createTraining(req.body);
  res.status(201).json({ message: 'Training created successfully', training });
});

const updateTraining = asyncHandler(async (req, res) => {
  const training = await trainingService.updateTraining(req.params.id, req.body);
  res.status(200).json({ message: 'Training updated successfully', training });
});

const deleteTraining = asyncHandler(async (req, res) => {
  await trainingService.deleteTraining(req.params.id);
  res.status(200).json({ message: 'Training deleted successfully' });
});

const assignTraining = asyncHandler(async (req, res) => {
  const result = await trainingService.assignTraining(req.params.id, req.body.employeeIds);
  res.status(200).json(result);
});

const markComplete = asyncHandler(async (req, res) => {
  const completion = await trainingService.markComplete(req.params.id, req.user._id);
  res.status(200).json({ message: 'Training marked as completed successfully', completion });
});

const getTrainings = asyncHandler(async (req, res) => {
  const { department } = req.query;
  const trainings = await trainingService.getTrainings({ department });
  res.status(200).json({ trainings });
});

const getEmployeeTrainingHistory = asyncHandler(async (req, res) => {
  const history = await trainingService.getEmployeeTrainingHistory(req.user._id);
  res.status(200).json({ history });
});

module.exports = {
  createTraining,
  updateTraining,
  deleteTraining,
  assignTraining,
  markComplete,
  getTrainings,
  getEmployeeTrainingHistory,
};
