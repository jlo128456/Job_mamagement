# models/hours_metric.py
from datetime import date
from sqlalchemy import Date, DateTime, func, UniqueConstraint
from . import db

class HoursMetric(db.Model):
    __tablename__ = "hours_metrics"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    day = db.Column(Date, nullable=False, default=date.today)
    labour_hours = db.Column(db.Float, default=0.0)
    onsite_hours = db.Column(db.Float, default=0.0)
    created_at = db.Column(DateTime, server_default=func.now())
    updated_at = db.Column(DateTime, onupdate=func.now())
    __table_args__ = (UniqueConstraint("user_id","day", name="uq_hoursmetrics_user_day"),)

    def to_dict(self):
        return {
            "id": self.id, "user_id": self.user_id, "role": self.role,
            "day": self.day.isoformat(), "labour_hours": self.labour_hours,
            "onsite_hours": self.onsite_hours
        }
