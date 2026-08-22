const express = require("express");
const ejs = require("ejs");
const { requireAuth } = require("./auth");
const { requireAdminInline } = require("./admin-helper");

const router = express.Router();

// CWE-1336: Server-Side Template Injection — an admin-authoring feature that lets
// staff preview a marketing email by rendering arbitrary EJS from the request body.
// EJS templates execute as JavaScript, so a payload like
//   <%= process.mainModule.require('child_process').execSync('id') %>
// achieves full RCE, not just a template-scoping bug.
router.post("/email-template/preview", requireAuth, requireAdminInline, (req, res) => {
  const { template, customerName, orderTotal } = req.body;
  try {
    const html = ejs.render(template, { customerName, orderTotal });
    res.send(html);
  } catch (e) {
    res.status(400).json({ error: "template render failed", detail: e.message });
  }
});

module.exports = router;
