# models/__init__.py
from flask_sqlalchemy import SQLAlchemy

# single shared SQLAlchemy instance
db = SQLAlchemy()

# import models/association so tables register on db.metadata
from .associations import job_machines  
from .user import User                  
from .machine import Machine           
from .job import Job                    
from .hours_metric import HoursMetric   
# allow: from models import db, User, Job, Machine, HoursMetric, job_machines
__all__ = ["db", "job_machines", "User", "Machine", "Job", "HoursMetric"]
