# Job-related endpoints 
from flask import Blueprint, request, jsonify
from models.models import db, Job
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
    try:
        role = data.get("role")
        name = data.get("contractor")  # this field is used for both contractor or technician names

        if not name or not role:
            return jsonify({"error": "Both role and contractor name are required"}), 400

        from models.models import User
        user = User.query.filter_by(contractor=name).first()
        if not user:
            return jsonify({"error": f"No user found with name '{name}'"}), 404

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
            created_at=datetime.utcnow()
        )

        # Assign user ID based on role
        if role == "contractor":
            new_job.assigned_contractor = user.id
        elif role == "technician":
            new_job.assigned_tech = user.id

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
        if "status" in data:
            job.status = data["status"]
        if "contractor_status" in data:
            job.contractor_status = data["contractor_status"]
        if "status_timestamp" in data:
            job.status_timestamp = now
        if "onsite_time" in data:
            job.onsite_time = now
        db.session.commit()
        return jsonify(job.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
