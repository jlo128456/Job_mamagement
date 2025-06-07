# Models: Job, User, Machine, etc.
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# ────────────────────────────────────────────────────────
# User Model
# ────────────────────────────────────────────────────────
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin', 'contractor', 'technician'
    contractor = db.Column(db.String(100), nullable=True)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

# ────────────────────────────────────────────────────────
# Job Model
# ────────────────────────────────────────────────────────
class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True)
    work_order = db.Column(db.String(100), unique=True, nullable=False)
    customer_name = db.Column(db.String(100))
    contractor = db.Column(db.String(100))
    role = db.Column(db.String(20))
    status = db.Column(db.String(50))
    machines = db.Column(db.Text)  # JSON string of machine IDs
    completion_date = db.Column(db.String)
    required_date = db.Column(db.String)
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
    assigned_contractor = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    assigned_tech = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    customer_address = db.Column(db.String)
    note_count = db.Column(db.Integer)

# ────────────────────────────────────────────────────────
# Machine Model
# ────────────────────────────────────────────────────────
class Machine(db.Model):
    __tablename__ = 'machines'

    id = db.Column(db.Integer, primary_key=True)
    machine_id = db.Column(db.String(50), unique=True, nullable=False)  # e.g., 'MX100'
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50))
    status = db.Column(db.String(50))  # e.g., 'active', 'maintenance', etc.
