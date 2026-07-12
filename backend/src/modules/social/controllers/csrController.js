const csrService = require('../services/csrService');
const asyncHandler = require('../../../utils/asyncHandler');

const createActivity = asyncHandler(async (req, res) => {
  const activity = await csrService.createActivity({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ message: 'Activity created successfully', activity });
});

const getActivities = asyncHandler(async (req, res) => {
  const { categoryId, departmentId, status } = req.query;
  const activities = await csrService.getActivities({ categoryId, departmentId, status });
  res.status(200).json({ activities });
});

const getActivityById = asyncHandler(async (req, res) => {
  const activity = await csrService.getActivityById(req.params.id);
  res.status(200).json({ activity });
});

const updateActivity = asyncHandler(async (req, res) => {
  const activity = await csrService.updateActivity(req.params.id, req.body);
  res.status(200).json({ message: 'Activity updated successfully', activity });
});

const deleteActivity = asyncHandler(async (req, res) => {
  await csrService.deleteActivity(req.params.id);
  res.status(200).json({ message: 'Activity deleted successfully' });
});

const publishActivity = asyncHandler(async (req, res) => {
  const activity = await csrService.publishActivity(req.params.id);
  res.status(200).json({ message: 'Activity published successfully', activity });
});

const closeActivity = asyncHandler(async (req, res) => {
  const activity = await csrService.closeActivity(req.params.id);
  res.status(200).json({ message: 'Activity closed successfully', activity });
});

module.exports = {
  createActivity, getActivities, getActivityById,
  updateActivity, deleteActivity, publishActivity, closeActivity,
};
