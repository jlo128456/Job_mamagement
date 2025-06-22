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
    print("📥 Incoming job data:", data)
    try:
        date = data.get("required_date")
        new_job = Job(
            work_order=data.get("work_order"),
            customer_name=data.get("customer_name"),
            contractor=data.get("contractor"),
            role=data.get("role"),
            status=data.get("status", "Pending"),
            machines=data.get("machines"),
            required_date=datetime.strptime(date, "%Y-%m-%d") if date else None,
            work_required=data.get("work_required"),
            customer_address=data.get("customer_address"),
            created_at=datetime.utcnow()
        )
        if data.get("role") == "contractor":
            new_job.assigned_contractor = data.get("assigned_user_id")
        elif data.get("role") == "technician":
            new_job.assigned_tech = data.get("assigned_user_id")

        db.session.add(new_job)
        db.session.commit()
        return jsonify(new_job.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@job_routes.route("/<int:job_id>", methods=["PUT"], strict_slashes=False)
def update_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    data = request.get_json()
    try:
        for field in data:
            if field == "required_date" and data[field]:
                setattr(job, field, datetime.strptime(data[field], "%Y-%m-%d"))
            elif hasattr(job, field):
                setattr(job, field, data[field])
        db.session.commit()
        return jsonify(job.to_dict()), 200
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
