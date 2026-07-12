// TODO (Person 4): Implement gamification service
// - getChallenges(query)
// - createChallenge(data)
// - joinChallenge({ challengeId, employeeId, proofUrl })
// - approveParticipation(participationId, { approval })
//   → award xp to employee
//   → call checkAndAwardBadges(employeeId)
// - checkAndAwardBadges(employeeId)  ← badge auto-award logic
// - getBadges()
// - createBadge(data)
// - getRewards()
// - createReward(data)
// - redeemReward(rewardId, employeeId)
//   → use mongoose.startSession() + session.startTransaction() for atomicity

module.exports = {};
