/**
 * EcoSphere Gamification Module Seed Script
 * Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const Department = require('./src/modules/core/models/Department.model');
const Category = require('./src/modules/core/models/Category.model');
const Employee = require('./src/modules/auth/models/Employee.model');
const Challenge = require('./src/modules/gamification/models/Challenge.model');
const Badge = require('./src/modules/gamification/models/Badge.model');
const Reward = require('./src/modules/gamification/models/Reward.model');

const HASH = (pw) => bcrypt.hashSync(pw, 10);

async function seed() {
  console.log('🌱 Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected');

  console.log('🗑️ Clearing existing gamification and core collections...');
  const ChallengeParticipation = require('./src/modules/gamification/models/ChallengeParticipation.model');
  await Promise.all([
    Department.deleteMany({}),
    Category.deleteMany({}),
    Employee.deleteMany({}),
    Challenge.deleteMany({}),
    ChallengeParticipation.deleteMany({}),
    Badge.deleteMany({}),
    Reward.deleteMany({}),
  ]);

  // 1. Seed Departments
  console.log('🏢 Seeding departments...');
  const [engineering, hr] = await Department.insertMany([
    { name: 'Engineering', code: 'ENG', head: 'Alice Chen', employeeCount: 2 },
    { name: 'Human Resources', code: 'HR', head: 'Carol Smith', employeeCount: 1 }
  ]);

  // 2. Seed Categories
  console.log('🏷️ Seeding categories...');
  const [challengeCat] = await Category.insertMany([
    { name: 'Green Initiative', type: 'CHALLENGE' }
  ]);

  // 3. Seed Employees
  console.log('👥 Seeding employees...');
  const [admin, manager, employee] = await Employee.insertMany([
    {
      name: 'Admin User',
      email: 'admin@ecosphere.com',
      passwordHash: HASH('Admin@123'),
      role: 'ADMIN',
      department: engineering._id,
      xp: 500,
      points: 200
    },
    {
      name: 'Manager User',
      email: 'manager@ecosphere.com',
      passwordHash: HASH('MANAGER', 'Manager@123'), // Fallback HASH check
      passwordHash: HASH('Manager@123'),
      role: 'MANAGER',
      department: engineering._id,
      xp: 300,
      points: 150
    },
    {
      name: 'Employee User',
      email: 'emp1@ecosphere.com',
      passwordHash: HASH('Emp@123'),
      role: 'EMPLOYEE',
      department: hr._id,
      xp: 120,
      points: 80
    },
    {
      name: 'Engineering Employee',
      email: 'emp2@ecosphere.com',
      passwordHash: HASH('Emp@123'),
      role: 'EMPLOYEE',
      department: engineering._id,
      xp: 150,
      points: 100
    }
  ]);

  // 4. Seed Challenges
  console.log('🏆 Seeding challenges...');
  await Challenge.insertMany([
    {
      title: 'Plant 10 Trees',
      category: challengeCat._id,
      description: 'Plant 10 trees in a local park and upload a photo as verification.',
      xp: 100,
      difficulty: 'Easy',
      evidenceRequired: true,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'ACTIVE'
    },
    {
      title: 'Save Electricity Month',
      category: challengeCat._id,
      description: 'Turn off all non-essential electric appliances during lunch breaks for 20 days.',
      xp: 150,
      difficulty: 'Medium',
      evidenceRequired: false,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE'
    },
    {
      title: 'Cycle to Work Challenge',
      category: challengeCat._id,
      description: 'Commute by bicycle for at least 10 days this month.',
      xp: 250,
      difficulty: 'Hard',
      evidenceRequired: true,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE'
    }
  ]);

  // 5. Seed Badges
  console.log('🏅 Seeding badges...');
  await Badge.insertMany([
    { name: 'Eco Starter', description: 'Cross 100 XP to start your journey', unlockType: 'xp', threshold: 100, icon: '🌱' },
    { name: 'Green Hero', description: 'Reach 300 XP and save the ecosystem', unlockType: 'xp', threshold: 300, icon: '🏆' },
    { name: 'Challenge Master', description: 'Complete 5 challenges successfully', unlockType: 'challengeCount', threshold: 5, icon: '👑' }
  ]);

  // 6. Seed Rewards
  console.log('🎁 Seeding rewards...');
  await Reward.insertMany([
    { name: 'Coffee Coupon', description: 'Free starbucks reusable cup hot drink coupon', pointsRequired: 50, stock: 10, status: 'Active' },
    { name: 'Movie Ticket', description: 'Eco-friendly cinema ticket voucher', pointsRequired: 150, stock: 5, status: 'Active' },
    { name: 'Lunch Voucher', description: 'Organic farm-to-table lunch voucher', pointsRequired: 200, stock: 3, status: 'Active' }
  ]);

  console.log('\n✅ Seeding complete successfully!');
  console.log('Logins:');
  console.log('  Admin: admin@ecosphere.com / Admin@123');
  console.log('  Manager: manager@ecosphere.com / Manager@123');
  console.log('  Employee: emp1@ecosphere.com / Emp@123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
