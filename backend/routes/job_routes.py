 #Job-related endpoints
from flask import Blueprint, request, jsonify
from models.models import db, Job
from datetime import datetime

job_routes = Blueprint("job_routes", __name__, url_prefix="/jobs")

# Get all jobs
@job_routes.route("/", methods=["GET"])
def get_jobs():
    jobs = Job.query.all()
    return jsonify([job.to_dict() for job in jobs]), 200

# Get job by ID
@job_routes.route("/<int:job_id>", methods=["GET"])
def get_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(job.to_dict()), 200

# Create a new job
@job_routes.route("/", methods=["POST"])
def create_job():
    data = request.get_json()
    try:
        new_job = Job(
            work_order=data.get("work_order"),
            customer_name=data.get("customer_name"),
            contractor=data.get("contractor"),
            role=data.get("role"),
            status=data.get("status", "Pending"),
            machines=data.get("machines"),
            required_date=data.get("required_date"),
            work_required=data.get("work_required"),
            customer_address=data.get("customer_address"),
            created_at=datetime.utcnow()
        )
        db.session.add(new_job)
        db.session.commit()
        return jsonify(new_job.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Update a job
@job_routes.route("/<int:job_id>", methods=["PUT"])
def update_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    data = request.get_json()
    try:
        for field in data:
            if hasattr(job, field):
                setattr(job, field, data[field])
        db.session.commit()
        return jsonify(job.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete a job
@job_routes.route("/<int:job_id>", methods=["DELETE"])
def delete_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    db.session.delete(job)
    db.session.commit()
    return jsonify({"message": f"Job {job_id} deleted"}), 200
