# models/associations.py
from . import db
job_machines = db.Table(
    "job_machines",
    db.Column("job_id", db.Integer, db.ForeignKey("jobs.id")),
    db.Column("machine_id", db.Integer, db.ForeignKey("machines.id")),
)
