/**
 * Default ESG scoring weights (must sum to 1).
 * Admins can override these via the Settings API (stored in DB) — this is the fallback.
 */
const DEFAULT_WEIGHTS = {
  environmental: 0.4,
  social: 0.3,
  governance: 0.3,
};

module.exports = { DEFAULT_WEIGHTS };
