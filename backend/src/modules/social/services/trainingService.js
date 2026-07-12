const Training = require('../models/Training');
const TrainingCompletion = require('../models/TrainingCompletion');
const Employee = require('../../auth/models/Employee.model');
const mongoose = require('mongoose');

async function createTraining({ title, description, department, startDate, endDate }) {
  const training = new Training({ title, description, department, startDate, endDate });
  await training.save();
  return training.populate('department');
}

async function updateTraining(id, updates) {
  const training = await Training.findByIdAndUpdate(id, updates, { new: true }).populate('department');
  if (!training) throw new Error('Training not found');
  return training;
}

async function deleteTraining(id) {
  const training = await Training.findByIdAndDelete(id);
  if (!training) throw new Error('Training not found');
  // Clean up completions
  await TrainingCompletion.deleteMany({ trainingId: id });
  return training;
}

async function assignTraining(trainingId, employeeIds) {
  const training = await Training.findById(trainingId);
  if (!training) throw new Error('Training not found');

  const operations = employeeIds.map((empId) => ({
    updateOne: {
      filter: { trainingId, employeeId: empId },
      update: { $setOnInsert: { status: 'assigned' } },
      upsert: true,
    },
  }));

  await TrainingCompletion.bulkWrite(operations);
  return { message: `Assigned training to ${employeeIds.length} employees` };
}

async function markComplete(trainingId, employeeId) {
  const training = await Training.findById(trainingId);
  if (!training) throw new Error('Training not found');

  const completion = await TrainingCompletion.findOneAndUpdate(
    { trainingId, employeeId },
    { status: 'completed', completionDate: new Date() },
    { new: true, upsert: true }
  ).populate('trainingId');

  return completion;
}

async function getTrainings(filters = {}) {
  const match = {};
  if (filters.department) {
    match.department = new mongoose.Types.ObjectId(filters.department);
  }

  // Use pipeline to compute stats
  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'trainingcompletions',
        localField: '_id',
        foreignField: 'trainingId',
        as: 'completions',
      },
    },
    {
      $addFields: {
        totalAssigned: { $size: '$completions' },
        totalCompleted: {
          $size: {
            $filter: {
              input: '$completions',
              as: 'c',
              cond: { $eq: ['$$c.status', 'completed'] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        completionRate: {
          $cond: {
            if: { $gt: ['$totalAssigned', 0] },
            then: { $multiply: [{ $divide: ['$totalCompleted', '$totalAssigned'] }, 100] },
            else: 0,
          },
        },
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'department',
        foreignField: '_id',
        as: 'departmentInfo',
      },
    },
    {
      $unwind: {
        path: '$departmentInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  return Training.aggregate(pipeline);
}

async function getEmployeeTrainingHistory(employeeId) {
  return TrainingCompletion.find({ employeeId })
    .populate({
      path: 'trainingId',
      populate: { path: 'department', select: 'name code' },
    })
    .sort({ updatedAt: -1 });
}

module.exports = {
  createTraining,
  updateTraining,
  deleteTraining,
  assignTraining,
  markComplete,
  getTrainings,
  getEmployeeTrainingHistory,
};
