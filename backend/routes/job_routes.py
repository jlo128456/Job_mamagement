from flask import Blueprint, request, jsonify, current_app
from flask_login import current_user
from models import db, User, Job, Machine, HoursMetric
from datetime import datetime, timezone
import json

job_routes = Blueprint("job_routes", __name__, url_prefix="/jobs")

@job_routes.route("/", methods=["GET"], strict_slashes=False)
def get_jobs():
    jobs = Job.query.order_by(Job.created_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs]), 200

@job_routes.route("/<int:job_id>", methods=["GET"], strict_slashes=False)
def get_job(job_id):
    j = Job.query.get(job_id)
    return (jsonify(j.to_dict()), 200) if j else (jsonify({"error": "Job not found"}), 404)

@job_routes.route("/", methods=["POST"], strict_slashes=False)
def create_job():
    d = request.get_json() or {}
    role, name = d.get("role"), d.get("contractor")
    if not role or not name:
        return jsonify({"error": "Role and contractor required"}), 400
    user = User.query.filter_by(contractor=name).first()
    if not user:
        return jsonify({"error": f"No user with contractor name '{name}'"}), 404
    try:
        last = Job.query.order_by(Job.id.desc()).first()
        next_num = 10001 if not last else int(last.work_order[2:]) + 1
        m_raw = d.get("machines", [])
        m_ids = json.loads(m_raw) if isinstance(m_raw, str) else (m_raw or [])
        new_job = Job(
            work_order=f"JM{next_num:05d}",
            customer_name=d.get("customer_name"),
            contractor=name,
            role=role,
            status=d.get("status", "Pending"),
            required_date=datetime.strptime(d["required_date"], "%Y-%m-%d") if d.get("required_date") else None,
            work_required=d.get("work_required"),
            customer_address=d.get("customer_address"),
            created_at=datetime.utcnow(),
            assigned_contractor=user.id if role == "contractor" else None,
            assigned_tech=user.id if role == "technician" else None,
            machines=Machine.query.filter(Machine.machine_id.in_(m_ids)).all() if m_ids else []
        )
        db.session.add(new_job); db.session.commit()
        payload = new_job.to_dict(); current_app.emit_job_events(payload)
        return jsonify(payload), 201
    except Exception as e:
        current_app.logger.exception("Job POST failed")
        db.session.rollback(); return jsonify({"error": str(e)}), 400

def _parse_iso_to_naive_utc(s: str, fallback: datetime):
    try:
        # Handle Z and offsets; store naive UTC to match other columns
        t = datetime.fromisoformat(s.replace("Z", "+00:00"))
        if t.tzinfo: t = t.astimezone(timezone.utc).replace(tzinfo=None)
        return t
    except Exception:
        return fallback

@job_routes.route("/<int:job_id>", methods=["PATCH"], strict_slashes=False)
def patch_job(job_id):
    job = Job.query.get(job_id)
    if not job: return jsonify({"error": "Job not found"}), 404
    d = request.get_json() or {}; now = datetime.utcnow()
    try:
        for f in ["customer_name","contact_name","travel_time","labour_hours","work_performed","status","contractor_status","signature"]:
            if f in d: setattr(job, f, d[f])

        if "checklist" in d:
            for k, v in (d.get("checklist") or {}).items():
                a = f"checklist_{k}"
                if hasattr(job, a): setattr(job, a, v)

        if d.get("status") == "Approved" and getattr(current_user, "role", "") != "admin":
            return jsonify({"error": "Only admin can approve"}), 403
        if d.get("status") == "Completed":
            job.completion_date = now

        if "onsite_time" in d:
            job.onsite_time = _parse_iso_to_naive_utc(str(d["onsite_time"]), now)

        if "machines" in d:
            m_raw = d["machines"]; m_ids = json.loads(m_raw) if isinstance(m_raw, str) else (m_raw or [])
            job.machines = Machine.query.filter(Machine.machine_id.in_(m_ids)).all() if m_ids else []

        job.status_timestamp = now
        db.session.commit()
        payload = job.to_dict(); current_app.emit_job_events(payload)
        return jsonify(payload), 200
    except Exception as e:
        current_app.logger.exception("Job PATCH failed")
        db.session.rollback(); return jsonify({"error": str(e)}), 400
