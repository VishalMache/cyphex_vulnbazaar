const Redis = require("ioredis");
const { REDIS_URL } = require("../config");

const redis = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
redis.connect().catch((err) => console.error("Redis connect error:", err.message));

module.exports = redis;
