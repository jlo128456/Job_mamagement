# models/job.py
from datetime import datetime
from sqlalchemy import DateTime, func
from . import db
from .associations import job_machines

class Job(db.Model):
    __tablename__ = "jobs"
    id = db.Column(db.Integer, primary_key=True)
    work_order = db.Column(db.String(100), unique=True, nullable=False)
    customer_name = db.Column(db.String(100))
    contractor = db.Column(db.String(100))
    role = db.Column(db.String(20))
    status = db.Column(db.String(50), default="Pending")
    required_date = db.Column(DateTime)
    completion_date = db.Column(DateTime)
    status_timestamp = db.Column(DateTime)
    onsite_time = db.Column(DateTime)
    created_at = db.Column(DateTime, server_default=func.now())
    checklist_no_missing_screws = db.Column(db.Boolean)
    checklist_software_updated = db.Column(db.Boolean)
    checklist_tested = db.Column(db.Boolean)
    checklist_approved_by_management = db.Column(db.Boolean)
    signature = db.Column(db.Text)
    contractor_status = db.Column(db.String)
    contact_name = db.Column(db.String)
    work_required = db.Column(db.Text)
    work_performed = db.Column(db.Text)
    travel_time = db.Column(db.String)
    labour_time = db.Column(db.String)
    customer_address = db.Column(db.String)
    note_count = db.Column(db.Integer)
    assigned_contractor = db.Column(db.Integer, db.ForeignKey("users.id"))
    assigned_tech = db.Column(db.Integer, db.ForeignKey("users.id"))
    machines = db.relationship("Machine", secondary=job_machines, back_populates="jobs")

    def to_dict(self):
        def fmt(dt): return dt.isoformat() if isinstance(dt, datetime) else None
        data = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        for k in ["required_date","completion_date","status_timestamp","onsite_time","created_at"]:
            data[k] = fmt(getattr(self, k))
        data["machines"] = [m.to_dict() for m in self.machines]
        return data
