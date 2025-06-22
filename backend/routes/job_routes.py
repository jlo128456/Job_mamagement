# Job-related endpoints 
from flask import Blueprint, request, jsonify
from models.models import db, Job
from datetime import datetime

job_routes = Blueprint("job_routes", __name__, url_prefix="/jobs")

# Get all jobs
@job_routes.route("/", methods=["GET"], strict_slashes=False)
def get_jobs():
    jobs = Job.query.all()
    return jsonify([job.to_dict() for job in jobs]), 200

# Get job by ID
@job_routes.route("/<int:job_id>", methods=["GET"], strict_slashes=False)
def get_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(job.to_dict()), 200

# Create a new job
@job_routes.route("/", methods=["POST"], strict_slashes=False)
def create_job():
    data = request.get_json()
    print("📥 Incoming job data:", data)  #  log incoming payload

    try:
        required_date = data.get("required_date")
        if required_date:
            required_date = datetime.strptime(required_date, "%Y-%m-%d")

        new_job = Job(
            work_order=data.get("work_order"),
            customer_name=data.get("customer_name"),
            contractor=data.get("contractor"),
            assigned_user_id=data.get("assigned_user_id"),
            role=data.get("role"),
            status=data.get("status", "Pending"),
            machines=data.get("machines"),
            required_date=required_date,
            work_required=data.get("work_required"),
            customer_address=data.get("customer_address"),
            created_at=datetime.utcnow()
        )

        db.session.add(new_job)
        db.session.commit()
        return jsonify(new_job.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()  #  detailed error traceback in terminal
        return jsonify({"error": str(e)}), 400


# Update a job (full replacement)
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

# Patch specific fields (status updates, timestamps, etc.)
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
