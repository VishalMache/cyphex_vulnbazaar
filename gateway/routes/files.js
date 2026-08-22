const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { requireAuth } = require("./auth");

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
const upload = multer({ dest: UPLOAD_DIR });

router.post("/upload", requireAuth, upload.single("file"), (req, res) => {
  res.json({ storedAs: req.file.filename, originalName: req.file.originalname });
});

// CWE-22: Path Traversal — the filename comes straight from the URL and is joined
// onto UPLOAD_DIR with no sanitization, so ../../gateway/config.js walks outside
// the intended directory.
router.get("/files/:name", requireAuth, (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.name);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "not found" });
  res.sendFile(filePath);
});

module.exports = router;
