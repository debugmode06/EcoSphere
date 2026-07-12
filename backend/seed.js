/**
 * EcoSphere Seed Script
 * Run: node seed.js
 *
 * Seeds: Departments, Employees, EsgPolicies, PolicyAcknowledgements,
 *        Audits, ComplianceIssues
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const Department = require('./src/modules/core/models/Department.model');
const Employee = require('./src/modules/auth/models/Employee.model');
const EsgPolicy = require('./src/modules/governance/models/EsgPolicy.model');
const PolicyAcknowledgement = require('./src/modules/governance/models/PolicyAcknowledgement.model');
const Audit = require('./src/modules/governance/models/Audit.model');
const ComplianceIssue = require('./src/modules/governance/models/ComplianceIssue.model');

async function seed() {
  console.log('🌱 Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected');

  // ── Clean existing data ──────────────────────────────────────────────────
  console.log('🧹 Clearing existing data...');
  await Promise.all([
    Department.deleteMany({}),
    Employee.deleteMany({}),
    EsgPolicy.deleteMany({}),
    PolicyAcknowledgement.deleteMany({}),
    Audit.deleteMany({}),
    ComplianceIssue.deleteMany({}),
  ]);

  // ── Departments ──────────────────────────────────────────────────────────
  console.log('🏢 Seeding departments...');
  const [engineering, operations, hr] = await Department.insertMany([
    { name: 'Engineering', code: 'ENG', head: 'Alice Singh', employeeCount: 10, status: 'Active' },
    { name: 'Operations', code: 'OPS', head: 'Bob Kumar', employeeCount: 8, status: 'Active' },
    { name: 'Human Resources', code: 'HR', head: 'Carol Mehta', employeeCount: 5, status: 'Active' },
  ]);

  // ── Employees ────────────────────────────────────────────────────────────
  console.log('👥 Seeding employees...');
  const hash = (pw) => bcrypt.hashSync(pw, 10);

  const [admin, manager1, emp1, emp2, emp3] = await Employee.insertMany([
    {
      name: 'Admin User',
      email: 'admin@ecosphere.com',
      passwordHash: hash('Admin@123'),
      role: 'ADMIN',
      department: engineering._id,
      xp: 500,
      points: 200,
    },
    {
      name: 'Manager One',
      email: 'manager1@ecosphere.com',
      passwordHash: hash('Manager@123'),
      role: 'MANAGER',
      department: operations._id,
      xp: 300,
      points: 120,
    },
    {
      name: 'Employee One',
      email: 'emp1@ecosphere.com',
      passwordHash: hash('Emp@123'),
      role: 'EMPLOYEE',
      department: engineering._id,
      xp: 100,
      points: 50,
    },
    {
      name: 'Employee Two',
      email: 'emp2@ecosphere.com',
      passwordHash: hash('Emp@123'),
      role: 'EMPLOYEE',
      department: operations._id,
      xp: 80,
      points: 30,
    },
    {
      name: 'Employee Three',
      email: 'emp3@ecosphere.com',
      passwordHash: hash('Emp@123'),
      role: 'EMPLOYEE',
      department: hr._id,
      xp: 60,
      points: 20,
    },
  ]);

  // ── ESG Policies ─────────────────────────────────────────────────────────
  console.log('📋 Seeding ESG policies...');
  const [policy1, policy2, policy3] = await EsgPolicy.insertMany([
    {
      title: 'Environmental Sustainability Policy',
      description:
        'All departments must reduce carbon emissions by 20% by end of fiscal year through energy efficiency measures and green procurement.',
      esgCategory: 'Environment',
      effectiveDate: new Date('2025-01-01'),
      expiryDate: new Date('2026-12-31'),
      priority: 'High',
      pdfUrl: 'https://example.com/policies/env-sustainability.pdf',
      version: '2.1',
      status: 'Published',
      publishedDate: new Date('2025-01-15'),
      createdBy: admin._id,
    },
    {
      title: 'Data Privacy & GDPR Compliance Policy',
      description:
        'This policy outlines our obligations under GDPR and internal data handling standards. All employees must complete mandatory training.',
      esgCategory: 'Governance',
      effectiveDate: new Date('2025-02-01'),
      priority: 'High',
      pdfUrl: 'https://example.com/policies/data-privacy.pdf',
      version: '1.3',
      status: 'Published',
      publishedDate: new Date('2025-03-01'),
      createdBy: admin._id,
    },
    {
      title: 'Workplace Diversity & Inclusion Policy',
      description:
        'EcoSphere is committed to fostering an inclusive environment. This draft policy outlines hiring, promotion, and anti-discrimination guidelines.',
      esgCategory: 'Social',
      effectiveDate: new Date('2025-06-01'),
      priority: 'Medium',
      version: '1.0',
      status: 'Draft',
      createdBy: admin._id,
    },
  ]);

  // ── Policy Acknowledgements ───────────────────────────────────────────────
  console.log('✅ Seeding policy acknowledgements...');
  await PolicyAcknowledgement.insertMany([
    {
      policy: policy1._id,
      employee: emp1._id,
      acknowledgedDate: new Date('2025-01-20'),
      feedback: 'Our department requires additional recycling bins.',
    },
    {
      policy: policy1._id,
      employee: emp2._id,
      acknowledgedDate: new Date('2025-01-22'),
    },
    {
      policy: policy2._id,
      employee: emp1._id,
      acknowledgedDate: new Date('2025-03-05'),
    },
  ]);

  // ── Audits ────────────────────────────────────────────────────────────────
  console.log('🔍 Seeding audits...');
  const [audit1, audit2] = await Audit.insertMany([
    {
      title: 'Q1 2025 Environmental Compliance Audit',
      department: engineering._id,
      date: new Date('2025-03-15'),
      findings:
        'Minor issues found with waste disposal labeling in Lab B. HVAC maintenance logs were incomplete for Feb. All critical items resolved.',
      status: 'Completed',
      createdBy: admin._id,
    },
    {
      title: 'Data Security & Privacy Audit 2025',
      department: operations._id,
      date: new Date('2026-08-20'),
      findings: '',
      status: 'Scheduled',
      createdBy: manager1._id,
    },
  ]);

  // ── Compliance Issues ─────────────────────────────────────────────────────
  console.log('⚠️  Seeding compliance issues...');
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 10); // 10 days ago → OVERDUE

  const futureDate1 = new Date();
  futureDate1.setDate(futureDate1.getDate() + 30); // 30 days from now

  const futureDate2 = new Date();
  futureDate2.setDate(futureDate2.getDate() + 15); // 15 days from now

  await ComplianceIssue.insertMany([
    {
      audit: audit1._id,
      severity: 'High',
      description:
        'HVAC maintenance logs were not maintained for February 2025. Required under ISO 14001 environmental management standard.',
      owner: 'Manager One',
      dueDate: pastDate, // deliberately past → isOverdue will be set by pre-save
      status: 'OPEN',
    },
    {
      severity: 'Medium',
      description:
        'Employee onboarding checklist does not include GDPR training module. All new hires must complete this within 2 weeks of joining.',
      owner: 'HR Manager',
      dueDate: futureDate1,
      status: 'OPEN',
    },
    {
      audit: audit1._id,
      severity: 'Low',
      description:
        'Waste disposal bins in Lab B were not labeled correctly. Re-labeling was completed and verified by the safety officer.',
      owner: 'Admin User',
      dueDate: futureDate2,
      status: 'RESOLVED',
      resolvedDate: new Date(),
      resolutionNotes: 'All bins relabeled and safety officer confirmed compliance on 2025-03-20.',
    },
    {
      severity: 'Critical',
      description:
        'Access control logs show unauthorized server room entry on 3 occasions in Q1. Must be investigated and systems updated immediately.',
      owner: 'Manager One',
      dueDate: futureDate2,
      status: 'OPEN',
    },
  ]);

  console.log('\n✅ Seeding complete!');
  console.log('─────────────────────────────────────────────────────────');
  console.log('  Default login credentials:');
  console.log('  admin@ecosphere.com    / Admin@123    (ADMIN)');
  console.log('  manager1@ecosphere.com / Manager@123  (MANAGER)');
  console.log('  emp1@ecosphere.com     / Emp@123      (EMPLOYEE)');
  console.log('  emp2@ecosphere.com     / Emp@123      (EMPLOYEE)');
  console.log('  emp3@ecosphere.com     / Emp@123      (EMPLOYEE)');
  console.log('─────────────────────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
