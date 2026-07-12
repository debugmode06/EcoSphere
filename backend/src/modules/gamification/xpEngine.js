const { checkBadgeUnlocks } = require('./badgeEngine');

async function awardXP(employeeId, amount, session) {
  const Employee = require('../auth/models/Employee.model');
  
  // Awarding XP also awards equivalent points as spendable currency for rewards
  const employee = await Employee.findByIdAndUpdate(
    employeeId,
    { $inc: { xp: amount, points: amount } },
    { new: true, session }
  );
  
  if (employee) {
    await checkBadgeUnlocks(employee, session);
  }
  
  return employee;
}

module.exports = { awardXP };
