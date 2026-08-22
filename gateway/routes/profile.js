const express = require("express");
const pool = require("../db/postgres");
const { Review } = require("../db/mongo");

const router = express.Router();

router.get("/:username", async (req, res) => {
  const userResult = await pool.query("SELECT id, username, bio FROM users WHERE username = $1", [
    req.params.username,
  ]);
  const user = userResult.rows[0];
  if (!user) return res.status(404).send("Not found");

  const reviews = await Review.find({ author: user.username }).limit(20);
  res.render("profile", { username: user.username, bio: user.bio || "", reviews });
});

module.exports = router;
