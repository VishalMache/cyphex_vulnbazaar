const express = require("express");
const pool = require("../db/postgres");
const { requireAuth } = require("./auth");
const { ADMIN_DEBUG_KEY } = require("../config");

const router = express.Router();

// CWE-489 / Auth Bypass: a leftover debug backdoor. Any request carrying the
// static x-debug-key header skips role checks entirely, independent of the
// caller's actual JWT role claim.
function requireAdmin(req, res, next) {
  if (req.headers["x-debug-key"] === ADMIN_DEBUG_KEY) return next();
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ error: "admin only" });
}

router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query("SELECT id, username, email, role FROM users ORDER BY id");
  res.json(result.rows);
});

router.get("/orders", requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query("SELECT * FROM orders ORDER BY id DESC LIMIT 200");
  res.json(result.rows);
});

module.exports = router;
