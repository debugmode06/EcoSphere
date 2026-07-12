const { validationResult } = require('express-validator');

/**
 * Runs after express-validator rules — returns 422 if any field fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

module.exports = validate;
