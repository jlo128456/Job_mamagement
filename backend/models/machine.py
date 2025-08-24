# models/machine.py
from . import db
from .associations import job_machines

class Machine(db.Model):
    __tablename__ = "machines"
    id = db.Column(db.Integer, primary_key=True)
    machine_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50))
    status = db.Column(db.String(50))
    jobs = db.relationship("Job", secondary=job_machines, back_populates="machines")

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
