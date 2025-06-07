import json
from datetime import datetime

# Format datetime to readable string
def format_datetime(dt, format="%Y-%m-%d %H:%M:%S"):
    if isinstance(dt, datetime):
        return dt.strftime(format)
    return dt  # fallback if not datetime

# Convert SQLAlchemy object to dict (fallback if not using `to_dict`)
def model_to_dict(obj):
    return {col.name: getattr(obj, col.name) for col in obj.__table__.columns}

# Parse JSON string safely
def parse_json_field(value):
    try:
        return json.loads(value) if value else []
    except (ValueError, TypeError):
        return []

# Serialize to JSON string for DB storage
def serialize_to_json(value):
    try:
        return json.dumps(value) if isinstance(value, (dict, list)) else str(value)
    except (TypeError, ValueError):
        return "[]"

# Apply visual colour or label based on job status (optional UI utility)
def get_status_label(status):
    return {
        "Pending": "warning",
        "In Progress": "primary",
        "Completed": "success",
        "Cancelled": "danger"
    }.get(status, "secondary")

# Generate a work order number (e.g., JM + 5-digit count)
def generate_work_order(counter):
    return f"JM{str(counter).zfill(5)}"
