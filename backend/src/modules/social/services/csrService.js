const CsrActivity = require('../models/CSRActivity');

async function createActivity({ title, description, categoryId, departmentId, location, startDate, endDate, maxParticipants, evidenceRequired, createdBy }) {
  const activity = new CsrActivity({
    title, description, categoryId, departmentId, location,
    startDate, endDate, maxParticipants, evidenceRequired, createdBy,
  });
  await activity.save();
  return activity.populate(['categoryId', 'departmentId', 'createdBy']);
}

async function getActivities(filters = {}) {
  const query = {};
  if (filters.categoryId) query.categoryId = filters.categoryId;
  if (filters.departmentId) query.departmentId = filters.departmentId;
  if (filters.status) query.status = filters.status;

  return CsrActivity.find(query)
    .populate('categoryId', 'name status')
    .populate('departmentId', 'name code')
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 });
}

async function getActivityById(id) {
  const activity = await CsrActivity.findById(id)
    .populate('categoryId', 'name status')
    .populate('departmentId', 'name code')
    .populate('createdBy', 'name email role');
  if (!activity) throw new Error('Activity not found');
  return activity;
}

async function updateActivity(id, updates) {
  const activity = await CsrActivity.findById(id);
  if (!activity) throw new Error('Activity not found');
  if (activity.status === 'closed') throw new Error('Cannot modify a closed activity');

  Object.assign(activity, updates);
  await activity.save();
  return activity.populate(['categoryId', 'departmentId', 'createdBy']);
}

async function deleteActivity(id) {
  const activity = await CsrActivity.findById(id);
  if (!activity) throw new Error('Activity not found');
  if (activity.status === 'active') throw new Error('Cannot delete an active activity. Close it first.');
  await CsrActivity.findByIdAndDelete(id);
  return activity;
}

async function publishActivity(id) {
  const activity = await CsrActivity.findById(id);
  if (!activity) throw new Error('Activity not found');
  if (activity.status !== 'draft') throw new Error('Only draft activities can be published');
  activity.status = 'active';
  await activity.save();
  return activity;
}

async function closeActivity(id) {
  const activity = await CsrActivity.findById(id);
  if (!activity) throw new Error('Activity not found');
  if (activity.status !== 'active') throw new Error('Only active activities can be closed');
  activity.status = 'closed';
  await activity.save();
  return activity;
}

module.exports = {
  createActivity, getActivities, getActivityById,
  updateActivity, deleteActivity, publishActivity, closeActivity,
};
