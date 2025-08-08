from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from models.models import db
import os

app = Flask(__name__)

# ----- CORS (local + Netlify + Render) -----
CORS(app,
     supports_credentials=True,
     origins=[
         "http://localhost:3000",
         "https://contractorapp1.netlify.app",
         "https://job-mamagement.onrender.com"
     ],
     methods=["GET","POST","PUT","DELETE","OPTIONS","PATCH"],
     allow_headers=["Content-Type"])

# ----- Database: env first, else local SQLite file -----
basedir = os.path.abspath(os.path.dirname(__file__))
local_db = f"sqlite:///{os.path.join(basedir, 'database', 'job_management.db')}"
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", local_db)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
migrate = Migrate(app, db)

# ----- Blueprints -----
from routes.job_routes import job_routes
from routes.user_routes import user_routes
from routes.machine_routes import machine_routes
app.register_blueprint(job_routes)
app.register_blueprint(user_routes)
app.register_blueprint(machine_routes)

# ----- Health -----
@app.get("/health")
def health():
    return {"ok": True}, 200

@app.get("/")
def index():
    return {"message": "API is running."}, 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
