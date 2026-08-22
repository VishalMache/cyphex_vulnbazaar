const express = require("express");
const fetch = require("node-fetch");
const { requireAuth } = require("./auth");
const { INVOICE_SERVICE_URL } = require("../config");

const router = express.Router();

// CWE-918: SSRF — the client-supplied logoUrl is forwarded to the invoice
// microservice, which fetches it server-side with no scheme/host allow-list.
// Chains with invoice-service's own unrestricted requests.get() to reach
// internal-only endpoints (e.g. http://169.254.169.254/latest/meta-data/,
// or the invoice-service's own loopback-bound admin route).
router.post("/generate", requireAuth, async (req, res) => {
  const { orderId, logoUrl, xmlData } = req.body;
  const upstream = await fetch(`${INVOICE_SERVICE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, logo_url: logoUrl, xml_data: xmlData }),
  });
  const buffer = await upstream.buffer();
  res.set("Content-Type", upstream.headers.get("content-type") || "application/pdf");
  res.send(buffer);
});

// CWE-918: SSRF — a second, even more direct proxy: whatever URL the client
// names is fetched by the server and echoed back, no validation at all.
router.get("/preview", requireAuth, async (req, res) => {
  const { url } = req.query;
  const upstream = await fetch(url);
  const text = await upstream.text();
  res.send(text);
});

module.exports = router;
