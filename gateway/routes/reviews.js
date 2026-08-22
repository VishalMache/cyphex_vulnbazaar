const express = require("express");
const { Review } = require("../db/mongo");

const router = express.Router();

// CWE-943: NoSQL Injection — the raw query object from the client is passed straight
// to Mongoose. A body like {"rating": {"$gt": 0}, "author": {"$ne": null}} bypasses any
// intended filter, and an admin-only variant of this pattern elsewhere can leak all docs.
router.get("/search", async (req, res) => {
  const filter = req.query; // e.g. ?rating[$ne]=0
  const reviews = await Review.find(filter).limit(50);
  res.json(reviews);
});

// CWE-79: Stored XSS — review body is trusted verbatim and later rendered unescaped
// in views/profile.ejs via <%- %>.
router.post("/", async (req, res) => {
  const { productId, author, body, rating } = req.body;
  const review = await Review.create({ productId, author, body, rating });
  res.status(201).json(review);
});

router.get("/product/:productId", async (req, res) => {
  const reviews = await Review.find({ productId: req.params.productId }).limit(50);
  res.json(reviews);
});

module.exports = router;
