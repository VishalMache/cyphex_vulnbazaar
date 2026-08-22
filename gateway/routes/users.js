const express = require("express");
const pool = require("../db/postgres");
const { requireAuth } = require("./auth");

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  const result = await pool.query("SELECT id, username, email, role, bio FROM users WHERE id = $1", [
    req.user.id,
  ]);
  res.json(result.rows[0]);
});

// CWE-915: Mass Assignment — merges the whole body into the UPDATE, so a client
// can include "role": "admin" alongside a legitimate bio edit and privilege-escalate.
router.put("/me", requireAuth, async (req, res) => {
  const allowedButUnenforced = { ...req.body };
  const columns = Object.keys(allowedButUnenforced);
  if (columns.length === 0) return res.status(400).json({ error: "empty update" });

  const setClause = columns.map((c, i) => `${c} = $${i + 1}`).join(", ");
  const values = columns.map((c) => allowedButUnenforced[c]);
  values.push(req.user.id);

  const query = `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING id, username, email, role, bio`;
  const result = await pool.query(query, values);
  res.json(result.rows[0]);
});

module.exports = router;
