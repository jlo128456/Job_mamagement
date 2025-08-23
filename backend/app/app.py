from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from models.models import db
import os

# --- Socket.IO ---
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)

# ----- CORS (local + Netlify + Render) -----
ORIGINS = [
    "http://localhost:3000",
    "https://contractorapp1.netlify.app",
    "https://job-mamagement.onrender.com",
]
CORS(
    app,
    supports_credentials=True,
    origins=ORIGINS,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type"]
)

# ----- Database: env first, else local SQLite file -----
basedir = os.path.abspath(os.path.dirname(__file__))
local_db = f"sqlite:///{os.path.join(basedir, 'database', 'job_management.db')}"
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", local_db)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
migrate = Migrate(app, db)

# ----- Socket.IO (WebSocket-only; no polling) -----
socketio = SocketIO(
    app,
    cors_allowed_origins=ORIGINS,
    async_mode="eventlet",      # or "gevent"
    transports=["websocket"],   # disable HTTP long-polling
    allow_upgrades=False,       # don't attempt polling->websocket upgrade
    # message_queue="redis://localhost:6379/0",  # enable if multi-worker
)

@socketio.on("connect")
def on_connect():
    emit("server:welcome", {"msg": "connected"})

@socketio.on("job:join")
def on_job_join(data):
    jid = (data or {}).get("job_id")
    if jid:
        join_room(f"job:{jid}")
        emit("chat:system", {"msg": f"joined job:{jid}"})

def emit_job_events(job_payload: dict):
    """
    Call this after any job change.
    Emits:
      - 'job:updated'   to room 'job:{id}' for viewers of that job
      - 'job:list:changed' broadcast so dashboards refresh lists
    """
    if not isinstance(job_payload, dict):
        return
    jid = job_payload.get("id")
    if jid is None:
        return
    socketio.emit("job:updated", job_payload, room=f"job:{jid}")
    socketio.emit("job:list:changed", {"id": jid}, broadcast=True)

# expose helper to blueprints without circular imports
app.emit_job_events = emit_job_events

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
    # IMPORTANT: use socketio.run so websockets work
    socketio.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
