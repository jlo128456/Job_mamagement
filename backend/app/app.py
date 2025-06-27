from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from models.models import db
import os

# Create Flask app
app = Flask(__name__)

# Setup CORS
CORS(app,
     supports_credentials=True,
     origins=["http://localhost:3000"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
     allow_headers=["Content-Type"])

# Configure SQLite database
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, "database", "job_management.db")
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialise DB and migration support
db.init_app(app)
migrate = Migrate(app, db)

# Import and register blueprints
from routes.job_routes import job_routes
from routes.user_routes import user_routes
from routes.machine_routes import machine_routes

app.register_blueprint(job_routes)
app.register_blueprint(user_routes)
app.register_blueprint(machine_routes)

# Health check route
@app.route("/")
def index():
    return {"message": "API is running."}, 200

# Optional: allow running directly with python app.py
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
