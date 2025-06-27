from flask import Blueprint, request, jsonify
from flask_login import current_user
from models.models import db, Job, User, Machine
from datetime import datetime
import json

job_routes = Blueprint("job_routes", __name__, url_prefix="/jobs")

@job_routes.route("/", methods=["GET"], strict_slashes=False)
def get_jobs():
    jobs = Job.query.order_by(Job.created_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs]), 200

@job_routes.route("/<int:job_id>", methods=["GET"], strict_slashes=False)
def get_job(job_id):
    job = Job.query.get(job_id)
    return (jsonify(job.to_dict()), 200) if job else (jsonify({"error": "Job not found"}), 404)

@job_routes.route("/", methods=["POST"], strict_slashes=False)
def create_job():
    d = request.get_json()
    role, name = d.get("role"), d.get("contractor")
    if not role or not name:
        return jsonify({"error": "Role and contractor required"}), 400

    user = User.query.filter_by(contractor=name).first()
    if not user:
        return jsonify({"error": f"No user with contractor name '{name}'"}), 404

    try:
        # Auto-generate work_order (e.g., JM10001)
        last_job = Job.query.order_by(Job.id.desc()).first()
        next_number = 10001 if not last_job else int(last_job.work_order[2:]) + 1
        new_work_order = f"JM{next_number:05d}"

        machines = json.loads(d.get("machines", "[]")) if isinstance(d.get("machines"), str) else d.get("machines", [])

        new_job = Job(
            work_order=new_work_order,
            customer_name=d.get("customer_name"),
            contractor=name,
            role=role,
            status=d.get("status", "Pending"),
            required_date=datetime.strptime(d.get("required_date", ""), "%Y-%m-%d") if d.get("required_date") else None,
            work_required=d.get("work_required"),
            customer_address=d.get("customer_address"),
            created_at=datetime.utcnow(),
            assigned_contractor=user.id if role == "contractor" else None,
            assigned_tech=user.id if role == "technician" else None,
            machines=Machine.query.filter(Machine.machine_id.in_(machines)).all()
        )

        db.session.add(new_job)
        db.session.commit()
        return jsonify(new_job.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@job_routes.route("/<int:job_id>", methods=["PATCH"], strict_slashes=False)
def patch_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    d = request.get_json()
    now = datetime.utcnow()

    try:
        for field in [
            "customer_name", "contact_name", "travel_time",
            "labour_hours", "work_performed", "status",
            "contractor_status", "signature"
        ]:
            if field in d:
                setattr(job, field, d[field])

        if "checklist" in d:
            for k, v in d["checklist"].items():
                attr = f"checklist_{k}"
                if hasattr(job, attr):
                    setattr(job, attr, v)

        if "status" in d:
            if d["status"] == "Approved" and getattr(current_user, "role", "") != "admin":
                return jsonify({"error": "Only admin can approve"}), 403
            if d["status"] == "Completed":
                job.completion_date = now

        if "onsite_time" in d:
            try:
                job.onsite_time = datetime.fromisoformat(d["onsite_time"])
            except:
                job.onsite_time = now

        if "machines" in d:
            machine_ids = json.loads(d["machines"]) if isinstance(d["machines"], str) else d["machines"]
            job.machines = Machine.query.filter(Machine.machine_id.in_(machine_ids)).all()

        job.status_timestamp = now

        db.session.commit()
        return jsonify(job.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400