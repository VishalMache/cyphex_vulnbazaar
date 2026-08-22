// CWE-798: Hardcoded Credentials — fallback secret compiled into the image, not injected
// only via environment. Anyone with the source (or the image layer) has the signing key.
const JWT_SECRET = process.env.JWT_SECRET || "supersecret123";

const ADMIN_DEBUG_KEY = process.env.ADMIN_DEBUG_KEY || "letmein2024";

module.exports = {
  PORT: process.env.PORT || 3000,
  PG_URL: process.env.PG_URL || "postgres://vulnuser:vulnpass123@localhost:5432/vulnbazaar",
  MONGO_URL: process.env.MONGO_URL || "mongodb://localhost:27017/vulnbazaar",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  INVOICE_SERVICE_URL: process.env.INVOICE_SERVICE_URL || "http://localhost:5000",
  OLLAMA_URL: process.env.OLLAMA_URL || "http://localhost:11434",
  JWT_SECRET,
  ADMIN_DEBUG_KEY,
};
