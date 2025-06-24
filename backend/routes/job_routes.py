from flask import Blueprint, request, jsonify
from flask_login import current_user
from models.models import db, Job, User
from datetime import datetime

job_routes = Blueprint("job_routes", __name__, url_prefix="/jobs")

@job_routes.route("/", methods=["GET"], strict_slashes=False)
def get_jobs():
    return jsonify([job.to_dict() for job in Job.query.all()]), 200

@job_routes.route("/<int:job_id>", methods=["GET"], strict_slashes=False)
def get_job(job_id):
    job = Job.query.get(job_id)
    return (jsonify(job.to_dict()), 200) if job else (jsonify({"error": "Job not found"}), 404)

@job_routes.route("/", methods=["POST"], strict_slashes=False)
def create_job():
    data = request.get_json()
    role = data.get("role")
    name = data.get("contractor")

    if not role or not name:
        return jsonify({"error": "Both role and contractor name are required"}), 400

    user = User.query.filter_by(contractor=name).first()
    if not user:
        return jsonify({"error": f"No user found with name '{name}'"}), 404

    try:
        required_date = data.get("required_date")
        new_job = Job(
            work_order=data.get("work_order"),
            customer_name=data.get("customer_name"),
            contractor=name,
            role=role,
            status=data.get("status", "Pending"),
            machines=data.get("machines"),
            required_date=datetime.strptime(required_date, "%Y-%m-%d") if required_date else None,
            work_required=data.get("work_required"),
            customer_address=data.get("customer_address"),
            created_at=datetime.utcnow(),
            assigned_contractor=user.id if role == "contractor" else None,
            assigned_tech=user.id if role == "technician" else None
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

    data = request.get_json()
    now = datetime.utcnow()

    try:
        # Apply standard fields
        for field in [
            "customer_name", "contact_name", "travel_time", "labour_hours",
            "work_performed", "checklist", "signature"
        ]:
            if field in data:
                setattr(job, field, data[field])

        # Handle status and contractor_status
        new_status = data.get("status")
        new_contractor_status = data.get("contractor_status")

        if (new_status and new_status != job.status) or (new_contractor_status and new_contractor_status != job.contractor_status):
            if new_status:
                if new_status == "Approved" and getattr(current_user, "role", None) != "admin":
                    return jsonify({"error": "Only admin can approve jobs"}), 403
                job.status = new_status
            if new_contractor_status:
                job.contractor_status = new_contractor_status
            job.status_timestamp = now

        # Set onsite time only if not already set
        if "onsite_time" in data and not job.onsite_time:
            job.onsite_time = now

        db.session.commit()
        return jsonify(job.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
