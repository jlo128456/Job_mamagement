from io import BytesIO
from datetime import datetime
from flask import Blueprint, jsonify, send_file, current_app
from flask_login import current_user

# --- shim must be before reportlab imports ---
import hashlib
try:
    hashlib.md5(b"", usedforsecurity=False)
except TypeError:
    _orig_md5 = hashlib.md5
    def _md5(*a, **kw):
        kw.pop("usedforsecurity", None)
        return _orig_md5(*a, **kw)
    hashlib.md5 = _md5

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit
from models import Job

job_pdf_routes = Blueprint("pdf_routes", __name__, url_prefix="/jobs")

@job_pdf_routes.get("/<int:job_id>/pdf")
def job_pdf(job_id: int):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    uid = getattr(current_user, "id", None)
    role = getattr(current_user, "role", "")
    if uid is not None and role != "admin" and uid not in (job.assigned_contractor, job.assigned_tech):
        return jsonify({"error": "Forbidden"}), 403

    try:
        buf = BytesIO()
        c = canvas.Canvas(buf, pagesize=A4)
        w, h = A4; x, y = 40, h - 50

        def row(label, value):
            nonlocal y
            v = "" if value is None else str(value)
            lines = simpleSplit(v, "Helvetica", 10, w - 2*x - 90)
            c.setFont("Helvetica-Bold", 11); c.drawString(x, y, f"{label}:")
            c.setFont("Helvetica", 10)
            for i, line in enumerate(lines):
                c.drawString(x + 120, y - i*12, line)
            y -= max(16, 12*len(lines) + 4)

        c.setFont("Helvetica-Bold", 16); c.drawString(x, y, "Technical Service Report"); y -= 20
        row("Work Order", job.work_order)
        row("Customer", job.customer_name)
        row("Address", job.customer_address)
        row("Status", job.status)
        row("Contractor Status", job.contractor_status)
        row("Required Date", job.required_date)
        row("Onsite Time", job.onsite_time)
        row("Completion Date", job.completion_date)
        row("Travel Time", job.travel_time)
        row("Labour Time (hrs)", getattr(job, "labour_time", ""))
        row("Work Required", job.work_required)
        row("Work Performed", job.work_performed)
        c.setFont("Helvetica-Oblique", 9)
        c.drawString(x, 40, f"Generated {datetime.utcnow().isoformat()}Z")
        c.showPage(); c.save(); buf.seek(0)

        fname = f"TSR_{job.work_order or job.id}.pdf"
        return send_file(buf, mimetype="application/pdf", as_attachment=True, download_name=fname)
    except Exception as e:
        current_app.logger.exception("PDF generation failed")
        return jsonify({"error": "PDF generation failed"}), 500

# Optional alias: /jobs/<id>/tsr.pdf
@job_pdf_routes.get("/<int:job_id>/tsr.pdf")
def job_pdf_alias(job_id: int):
    return job_pdf(job_id)
