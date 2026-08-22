const mongoose = require("mongoose");
const { MONGO_URL } = require("../config");

mongoose.connect(MONGO_URL).catch((err) => {
  console.error("Mongo connect error (continuing, service degrades):", err.message);
});

const reviewSchema = new mongoose.Schema({
  productId: String,
  author: String,
  body: String,
  rating: Number,
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = { Review };
