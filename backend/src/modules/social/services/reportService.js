const Employee = require('../../auth/models/Employee.model');
const CsrActivity = require('../models/CSRActivity');
const Participation = require('../models/Participation');
const Training = require('../models/Training');
const TrainingCompletion = require('../models/TrainingCompletion');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

async function getDiversityMetrics() {
  const result = await Employee.aggregate([
    {
      $facet: {
        genderSplit: [
          { $group: { _id: { $ifNull: ["$gender", "Not Specified"] }, count: { $sum: 1 } } }
        ],
        locationSplit: [
          { $group: { _id: { $ifNull: ["$location", "Remote"] }, count: { $sum: 1 } } }
        ],
        ageGroups: [
          {
            $bucket: {
              groupBy: { $ifNull: ["$age", 30] },
              boundaries: [18, 30, 45, 60, 100],
              default: "Other",
              output: { count: { $sum: 1 } }
            }
          }
        ],
        departmentHeadcount: [
          { $group: { _id: "$department", count: { $sum: 1 } } },
          {
            $lookup: {
              from: "departments",
              localField: "_id",
              foreignField: "_id",
              as: "dept"
            }
          },
          { $unwind: "$dept" },
          {
            $project: {
              name: "$dept.name",
              count: 1
            }
          }
        ]
      }
    }
  ]);

  const raw = result[0];
  const totalEmployees = await Employee.countDocuments({});

  // Helper to add percentages
  const withPercentages = (arr) => {
    return arr.map(item => ({
      name: item._id?.name || item.name || item._id,
      count: item.count,
      percentage: totalEmployees > 0 ? parseFloat(((item.count / totalEmployees) * 100).toFixed(1)) : 0
    }));
  };

  // Age group label helper
  const ageLabels = {
    18: "18-29",
    30: "30-44",
    45: "45-59",
    60: "60+"
  };

  const ageGroupsFormatted = raw.ageGroups.map(item => ({
    name: ageLabels[item._id] || item._id,
    count: item.count,
    percentage: totalEmployees > 0 ? parseFloat(((item.count / totalEmployees) * 100).toFixed(1)) : 0
  }));

  return {
    totalEmployees,
    genderSplit: withPercentages(raw.genderSplit),
    locationSplit: withPercentages(raw.locationSplit),
    departmentHeadcount: withPercentages(raw.departmentHeadcount),
    ageGroups: ageGroupsFormatted
  };
}

async function getSocialReport(filters = {}) {
  // 1. Build CSR Activity match query
  const csrMatch = {};
  if (filters.department) csrMatch.departmentId = new mongoose.Types.ObjectId(filters.department);
  if (filters.category) csrMatch.categoryId = new mongoose.Types.ObjectId(filters.category);
  
  if (filters.startDate || filters.endDate) {
    csrMatch.startDate = {};
    if (filters.startDate) csrMatch.startDate.$gte = new Date(filters.startDate);
    if (filters.endDate) csrMatch.startDate.$lte = new Date(filters.endDate);
  }

  // Get total activities and breakdown by status
  const csrActivities = await CsrActivity.find(csrMatch);
  const totalActivities = csrActivities.length;
  const csrStatusCounts = { draft: 0, active: 0, closed: 0 };
  csrActivities.forEach(act => {
    if (csrStatusCounts[act.status] !== undefined) {
      csrStatusCounts[act.status]++;
    }
  });

  // 2. Build Participation match query
  const partMatch = {};
  if (filters.employee) partMatch.employeeId = new mongoose.Types.ObjectId(filters.employee);
  
  // Constrain participations to matching CSR activities
  const matchedActivityIds = csrActivities.map(a => a._id);
  partMatch.csrActivityId = { $in: matchedActivityIds };

  const participationStats = await Participation.aggregate([
    { $match: partMatch },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  const participationCounts = { approved: 0, pending: 0, rejected: 0, total: 0 };
  participationStats.forEach(stat => {
    if (participationCounts[stat._id] !== undefined) {
      participationCounts[stat._id] = stat.count;
      participationCounts.total += stat.count;
    }
  });

  // 3. Build Training match query
  const trainingMatch = {};
  if (filters.department) trainingMatch.department = new mongoose.Types.ObjectId(filters.department);
  if (filters.startDate || filters.endDate) {
    trainingMatch.startDate = {};
    if (filters.startDate) trainingMatch.startDate.$gte = new Date(filters.startDate);
    if (filters.endDate) trainingMatch.startDate.$lte = new Date(filters.endDate);
  }

  const matchedTrainings = await Training.find(trainingMatch);
  const trainingIds = matchedTrainings.map(t => t._id);

  const tcMatch = { trainingId: { $in: trainingIds } };
  if (filters.employee) tcMatch.employeeId = new mongoose.Types.ObjectId(filters.employee);

  const trainingStats = await TrainingCompletion.aggregate([
    { $match: tcMatch },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const trainingCounts = { assigned: 0, completed: 0, notStarted: 0, total: 0 };
  trainingStats.forEach(stat => {
    const key = stat._id === 'not started' ? 'notStarted' : stat._id;
    if (trainingCounts[key] !== undefined) {
      trainingCounts[key] = stat.count;
      trainingCounts.total += stat.count;
    }
  });

  const trainingCompletionRate = trainingCounts.total > 0
    ? parseFloat(((trainingCounts.completed / trainingCounts.total) * 100).toFixed(1))
    : 0;

  // 4. Diversity Summary
  const diversity = await getDiversityMetrics();

  // 5. Compute Social Score
  // Score formula: (Approved Participations * 15) + (Total Activities * 10) + (Training Completion Rate * 0.5)
  // Scaled composite score out of 100
  const rawScore = (participationCounts.approved * 15) + (totalActivities * 10) + (trainingCompletionRate * 0.5);
  const socialScore = Math.min(100, Math.round(rawScore));

  return {
    filters,
    csrActivityCounts: {
      total: totalActivities,
      ...csrStatusCounts
    },
    participationCounts,
    trainingStats: {
      ...trainingCounts,
      completionRate: trainingCompletionRate
    },
    diversitySummary: {
      totalEmployees: diversity.totalEmployees,
      genderSplit: diversity.genderSplit,
      departmentHeadcount: diversity.departmentHeadcount
    },
    socialScore
  };
}

function generateCSVReport(reportData) {
  const lines = [];
  lines.push("EcoSphere ESG Platform - Social ESG Report");
  lines.push(`Generated: ${new Date().toLocaleDateString()}`);
  lines.push("");

  lines.push("Metric,Value");
  lines.push(`Total CSR Activities,${reportData.csrActivityCounts.total}`);
  lines.push(`Active CSR Activities,${reportData.csrActivityCounts.active}`);
  lines.push(`Closed CSR Activities,${reportData.csrActivityCounts.closed}`);
  lines.push(`Draft CSR Activities,${reportData.csrActivityCounts.draft}`);
  lines.push("");

  lines.push("Participation Status,Count");
  lines.push(`Total Participations,${reportData.participationCounts.total}`);
  lines.push(`Approved,${reportData.participationCounts.approved}`);
  lines.push(`Pending,${reportData.participationCounts.pending}`);
  lines.push(`Rejected,${reportData.participationCounts.rejected}`);
  lines.push("");

  lines.push("Training Metrics,Value");
  lines.push(`Total Assigned,${reportData.trainingStats.total}`);
  lines.push(`Completed,${reportData.trainingStats.completed}`);
  lines.push(`Completion Rate (%),${reportData.trainingStats.completionRate}`);
  lines.push("");

  lines.push("Computed Social Score,Value");
  lines.push(`Composite Social ESG Score,${reportData.socialScore}`);

  return lines.join("\n");
}

function generatePDFReport(reportData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
    doc.on('error', reject);

    // Title / Header
    doc.fillColor("#1e293b").fontSize(22).text("EcoSphere ESG Management Platform", { align: "center" });
    doc.fontSize(14).fillColor("#475569").text("Social Module (S) Performance Report", { align: "center" });
    doc.moveDown();
    doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1.5);

    // General Summary Section
    doc.fontSize(16).fillColor("#1e293b").text("1. Composite Social Score", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(32).fillColor("#0284c7").text(`${reportData.socialScore}/100`, { align: "center" });
    doc.fontSize(10).fillColor("#64748b").text("Composite score calculated based on CSR active programs, employee approvals, and training completion rate.", { align: "center" });
    doc.moveDown(2);

    // CSR & Participations
    doc.fontSize(16).fillColor("#1e293b").text("2. CSR Activities & Participation Summary");
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#334155");
    doc.text(`Total CSR Programs: ${reportData.csrActivityCounts.total}`);
    doc.text(`Active Programs: ${reportData.csrActivityCounts.active}`);
    doc.text(`Completed Programs: ${reportData.csrActivityCounts.closed}`);
    doc.moveDown(0.5);
    doc.text(`Total Employee Participations: ${reportData.participationCounts.total}`);
    doc.text(`Approved Participations: ${reportData.participationCounts.approved}`);
    doc.text(`Pending Approvals: ${reportData.participationCounts.pending}`);
    doc.moveDown(2);

    // Training & Education
    doc.fontSize(16).fillColor("#1e293b").text("3. Training & Education Performance");
    doc.moveDown(0.5);
    doc.text(`Total Course Enrollments: ${reportData.trainingStats.total}`);
    doc.text(`Completed Courses: ${reportData.trainingStats.completed}`);
    doc.fontSize(12).fillColor("#16a34a").text(`Training Completion Rate: ${reportData.trainingStats.completionRate}%`);
    doc.moveDown(2);

    // Diversity
    doc.fontSize(16).fillColor("#1e293b").text("4. Headcount & Diversity Summary");
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#334155");
    doc.text(`Total Active Workforce Count: ${reportData.diversitySummary.totalEmployees}`);
    doc.moveDown(0.5);
    doc.text("Department Headcount Breakdown:");
    reportData.diversitySummary.departmentHeadcount.forEach(dept => {
      doc.text(`- ${dept.name}: ${dept.count} (${dept.percentage}%)`);
    });

    doc.end();
  });
}

async function generateExcelReport(reportData) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Social Performance Summary");

  sheet.columns = [
    { header: "Metric Category", key: "category", width: 35 },
    { header: "Sub Metric", key: "sub", width: 25 },
    { header: "Value", key: "val", width: 15 }
  ];

  sheet.addRow(["Social ESG Index", "Composite Social Score", reportData.socialScore]);
  sheet.addRow([]);

  sheet.addRow(["CSR Activities", "Total Activities", reportData.csrActivityCounts.total]);
  sheet.addRow(["CSR Activities", "Active Activities", reportData.csrActivityCounts.active]);
  sheet.addRow(["CSR Activities", "Closed Activities", reportData.csrActivityCounts.closed]);
  sheet.addRow([]);

  sheet.addRow(["Employee Participation", "Total Signups", reportData.participationCounts.total]);
  sheet.addRow(["Employee Participation", "Approved Count", reportData.participationCounts.approved]);
  sheet.addRow(["Employee Participation", "Pending Approval", reportData.participationCounts.pending]);
  sheet.addRow([]);

  sheet.addRow(["Training & Education", "Total Assigned", reportData.trainingStats.total]);
  sheet.addRow(["Training & Education", "Total Completed", reportData.trainingStats.completed]);
  sheet.addRow(["Training & Education", "Completion Rate (%)", reportData.trainingStats.completionRate]);

  // Style header row
  sheet.getRow(1).font = { bold: true };

  return workbook.xlsx.writeBuffer();
}

module.exports = {
  getDiversityMetrics,
  getSocialReport,
  generateCSVReport,
  generatePDFReport,
  generateExcelReport
};
