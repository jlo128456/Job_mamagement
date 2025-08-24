# models/user.py
from . import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    contractor = db.Column(db.String(100))

    jobs_as_contractor = db.relationship(
        "Job", foreign_keys="Job.assigned_contractor", backref="contractor_user", lazy=True
    )
    jobs_as_tech = db.relationship(
        "Job", foreign_keys="Job.assigned_tech", backref="technician_user", lazy=True
    )

    def set_password(self, pwd): self.password = generate_password_hash(pwd)
    def check_password(self, pwd): return check_password_hash(self.password, pwd)
    def to_dict(self): return {"id": self.id, "email": self.email, "role": self.role, "contractor": self.contractor}
