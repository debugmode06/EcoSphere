/**
 * Wraps async route handlers so errors are forwarded to the global error handler
 * instead of causing unhandled promise rejections.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
