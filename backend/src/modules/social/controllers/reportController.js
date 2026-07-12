const reportService = require('../services/reportService');
const asyncHandler = require('../../../utils/asyncHandler');

const getDiversityMetrics = asyncHandler(async (req, res) => {
  const metrics = await reportService.getDiversityMetrics();
  res.status(200).json(metrics);
});

const getSocialReport = asyncHandler(async (req, res) => {
  const { department, employee, category, startDate, endDate } = req.query;
  const report = await reportService.getSocialReport({
    department,
    employee,
    category,
    startDate,
    endDate,
  });
  res.status(200).json(report);
});

const exportSocialReport = asyncHandler(async (req, res) => {
  const { format, department, employee, category, startDate, endDate } = req.query;
  
  const report = await reportService.getSocialReport({
    department,
    employee,
    category,
    startDate,
    endDate,
  });

  const filename = `social-esg-report-${new Date().toISOString().split('T')[0]}`;

  if (format === 'csv') {
    const csv = reportService.generateCSVReport(report);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
    return res.status(200).send(csv);
  }

  if (format === 'pdf') {
    const pdfBuffer = await reportService.generatePDFReport(report);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
    return res.status(200).send(pdfBuffer);
  }

  if (format === 'excel') {
    const excelBuffer = await reportService.generateExcelReport(report);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
    return res.status(200).send(excelBuffer);
  }

  res.status(400).json({ message: 'Invalid format. Use csv, pdf, or excel.' });
});

module.exports = {
  getDiversityMetrics,
  getSocialReport,
  exportSocialReport,
};
