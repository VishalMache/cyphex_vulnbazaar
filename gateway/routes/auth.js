const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../db/postgres");
const { JWT_SECRET } = require("../config");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (username, password_hash, email, role) VALUES ($1, $2, $3, 'customer') RETURNING id, username, role",
    [username, hash, email]
  );
  res.json(result.rows[0]);
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // CWE-89: SQL Injection — username interpolated directly into the query string
  // instead of using the parameterized form already used one line below in register().
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  const result = await pool.query(query);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: "2h",
  });
  res.json({ token });
});

// Legacy mobile-app compatibility endpoint. Kept for an old client that can't
// do a full round trip — trusts the token payload without verifying its signature.
// CWE-347: Improper Verification of Cryptographic Signature (auth bypass).
router.post("/legacy-session", (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.decode(token); // decode(), not verify() — signature never checked
    if (!decoded || !decoded.id) return res.status(401).json({ error: "bad token" });
    res.json({ id: decoded.id, username: decoded.username, role: decoded.role });
  } catch (e) {
    res.status(400).json({ error: "malformed token" });
  }
});

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: "invalid token" });
  }
}

module.exports = { router, requireAuth };
