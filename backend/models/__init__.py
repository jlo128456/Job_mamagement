# models/__init__.py
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

# import models so they register with SQLAlchemy metadata
from .associations import job_machines  
from .user import User                  
from .machine import Machine            
from .job import Job                    
from .hours_metric import HoursMetric   
