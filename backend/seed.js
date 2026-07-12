/**
 * EcoSphere Seed Script
 * Run: node seed.js
 *
 * TODO: Implement seeding logic after all models are built.
 * Required seeds:
 *   - 3 Departments (Engineering, Operations, HR)
 *   - 2 Categories (CSR_ACTIVITY, CHALLENGE)
 *   - 5 Employees (1 ADMIN, 1 MANAGER, 3 EMPLOYEES) with bcrypt passwords
 *   - 2 EmissionFactors
 *   - 2 CarbonTransactions
 *   - 1 EnvironmentalGoal
 *   - 2 CsrActivities
 *   - 2 EmployeeParticipations
 *   - 1 EsgPolicy + 1 Audit + 1 ComplianceIssue
 *   - 2 Challenges
 *   - 2 Badges
 *   - 1 Reward
 *   - DepartmentScores for each dept
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function seed() {
  console.log('🌱 Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected — TODO: add seed data');

  // TODO: Require models and insert seed data here

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
