const express = require("express");
const redis = require("../db/redis");
const { requireAuth } = require("./auth");

const router = express.Router();

const COUPON_LIMIT = 1; // "WELCOME10" may be redeemed once per account, globally rate-limited to 100 total uses
const GLOBAL_CAP = 100;

// CWE-362: Race Condition / TOCTOU — read-then-write instead of an atomic INCR.
// Firing this endpoint concurrently lets the global redemption count blow past
// GLOBAL_CAP because every request reads the same stale count before any of
// them writes back.
router.post("/redeem", requireAuth, async (req, res) => {
  const { code } = req.body;
  if (code !== "WELCOME10") return res.status(404).json({ error: "unknown coupon" });

  const userKey = `coupon:${code}:user:${req.user.id}`;
  const globalKey = `coupon:${code}:global_count`;

  const alreadyUsed = await redis.get(userKey);
  if (alreadyUsed) return res.status(409).json({ error: "already redeemed" });

  const currentCount = parseInt((await redis.get(globalKey)) || "0", 10);
  if (currentCount >= GLOBAL_CAP) return res.status(410).json({ error: "coupon exhausted" });

  // Window between the read above and the write below is where concurrent
  // requests race each other past both the per-user and global limits.
  await redis.set(userKey, "1");
  await redis.set(globalKey, String(currentCount + 1));

  res.json({ discountPercent: 10, remaining: GLOBAL_CAP - currentCount - 1 });
});

module.exports = router;
