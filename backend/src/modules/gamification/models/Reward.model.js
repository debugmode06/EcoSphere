const mongoose = require('mongoose');

// TODO (Person 4): Define Reward schema
// Fields: name (required), description, pointsRequired (required), stock (required), status
// Business rule: use Mongoose session/transaction to atomically decrement employee.points + reward.stock on redeem

const rewardSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Reward', rewardSchema);
