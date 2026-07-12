// TODO (Person 4): Implement notification service
// Wire up to email (nodemailer) or Slack webhook in production

const notify = (type, payload) => {
  console.log(`[NOTIFICATION] type="${type}"`, JSON.stringify(payload));
  // TODO: send email / Slack
};

const notifyOverdueCompliance = (issue) => notify('COMPLIANCE_OVERDUE', { issueId: issue._id });
const notifyBadgeUnlocked = (employee, badge) => notify('BADGE_UNLOCKED', { employeeName: employee.name, badge: badge.name });

module.exports = { notify, notifyOverdueCompliance, notifyBadgeUnlocked };
