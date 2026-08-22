const express = require("express");
const pool = require("../db/postgres");
const { requireAuth } = require("./auth");

const router = express.Router();

// CWE-639: IDOR — any authenticated user can fetch any order by guessing sequential
// ids; there is no check that req.user.id owns the order.
router.get("/:id", requireAuth, async (req, res) => {
  const result = await pool.query("SELECT * FROM orders WHERE id = $1", [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ error: "not found" });
  res.json(result.rows[0]);
});

router.get("/", requireAuth, async (req, res) => {
  const result = await pool.query("SELECT * FROM orders WHERE user_id = $1", [req.user.id]);
  res.json(result.rows);
});

// CWE-915: Mass Assignment — the entire request body is trusted, including fields
// like `total_cents` and `status` that should be server-computed, letting a client
// check out a cart for $0.01 or mark an order pre-paid.
router.post("/", requireAuth, async (req, res) => {
  const body = { ...req.body, user_id: req.user.id };
  const columns = Object.keys(body);
  const values = Object.values(body);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  const query = `INSERT INTO orders (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`;
  const result = await pool.query(query, values);
  res.status(201).json(result.rows[0]);
});

module.exports = router;
