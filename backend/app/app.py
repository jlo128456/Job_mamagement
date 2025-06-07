#Flask entry point (main app setup)
import os
from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from models.models import db

from routes.job_routes import job_routes
from routes.user_routes import user_routes
from routes.machine_routes import machine_routes  # Optional

app = Flask(__name__)
CORS(app)

# Connect to job_management.db
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, "database", "job_management.db")
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Init DB and migrations
db.init_app(app)
migrate = Migrate(app, db)

# Register route blueprints
app.register_blueprint(job_routes)
app.register_blueprint(user_routes)
app.register_blueprint(machine_routes)

# Optional: API root health check
@app.route("/")
def index():
    return {"message": "API is running."}, 200
