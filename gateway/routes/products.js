const express = require("express");
const pool = require("../db/postgres");

const router = express.Router();

// CWE-89: SQL Injection — search term concatenated straight into an ILIKE clause.
router.get("/search", async (req, res) => {
  const q = req.query.q || "";
  const query = `SELECT id, name, price, description FROM products WHERE name ILIKE '%${q}%'`;
  const result = await pool.query(query);
  res.json(result.rows);
});

// Safe: parameterized query (should NOT be flagged) — kept side by side with the
// vulnerable search above so CYPHEX's false-positive scoring has a real contrast to draw.
router.get("/:id", async (req, res) => {
  const result = await pool.query("SELECT id, name, price, description FROM products WHERE id = $1", [
    req.params.id,
  ]);
  if (!result.rows[0]) return res.status(404).json({ error: "not found" });
  res.json(result.rows[0]);
});

router.get("/", async (req, res) => {
  const result = await pool.query("SELECT id, name, price, description FROM products ORDER BY id");
  res.json(result.rows);
});

module.exports = router;
