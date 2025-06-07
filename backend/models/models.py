# Models: Job, User, Machine, etc.
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    contractor = db.Column(db.String(100))
    jobs_as_contractor = db.relationship("Job", foreign_keys='Job.assigned_contractor', backref="contractor_user", lazy=True)
    jobs_as_tech = db.relationship("Job", foreign_keys='Job.assigned_tech', backref="technician_user", lazy=True)

    def set_password(self, password): self.password = generate_password_hash(password)
    def check_password(self, password): return check_password_hash(self.password, password)
    def to_dict(self): return {"id": self.id, "email": self.email, "role": self.role, "contractor": self.contractor}

class Job(db.Model):
    __tablename__ = 'jobs'
    id = db.Column(db.Integer, primary_key=True)
    work_order = db.Column(db.String(100), unique=True, nullable=False)
    customer_name = db.Column(db.String(100))
    contractor = db.Column(db.String(100))
    role = db.Column(db.String(20))
    status = db.Column(db.String(50), default="Pending")
    machines = db.Column(db.Text)
    required_date = db.Column(db.String)
    completion_date = db.Column(db.String)
    checklist_no_missing_screws = db.Column(db.Boolean)
    checklist_software_updated = db.Column(db.Boolean)
    checklist_tested = db.Column(db.Boolean)
    checklist_approved_by_management = db.Column(db.Boolean)
    signature = db.Column(db.Text)
    status_timestamp = db.Column(db.String)
    contractor_status = db.Column(db.String)
    onsite_time = db.Column(db.String)
    contact_name = db.Column(db.String)
    work_required = db.Column(db.Text)
    work_performed = db.Column(db.Text)
    travel_time = db.Column(db.String)
    labour_time = db.Column(db.String)
    created_at = db.Column(db.DateTime)
    customer_address = db.Column(db.String)
    note_count = db.Column(db.Integer)
    assigned_contractor = db.Column(db.Integer, db.ForeignKey('users.id'))
    assigned_tech = db.Column(db.Integer, db.ForeignKey('users.id'))

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
#machine model
class Machine(db.Model):
    __tablename__ = 'machines'
    id = db.Column(db.Integer, primary_key=True)
    machine_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50))
    status = db.Column(db.String(50))

    def to_dict(self): return {c.name: getattr(self, c.name) for c in self.__table__.columns}
