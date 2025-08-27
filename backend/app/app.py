from flask import Flask, request
from flask_migrate import Migrate
from flask_cors import CORS
from models import db
import os, sys, logging
from routes.metrics_routes import metrics_routes
from flask_socketio import SocketIO, emit, join_room
from routes.pdf_routes import job_pdf_routes

logging.basicConfig(level=logging.INFO, stream=sys.stdout,
                    format='[%(asctime)s] %(levelname)s: %(message)s')

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://contractorapp1.netlify.app",
    "https://job-mamagement.onrender.com",
]
CORS(app, supports_credentials=True, origins=ORIGINS,
     methods=["GET","POST","PUT","DELETE","OPTIONS","PATCH"],
     allow_headers=["Content-Type"])

basedir = os.path.abspath(os.path.dirname(__file__))
local_db = f"sqlite:///{os.path.join(basedir, 'database', 'job_management.db')}"
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", local_db)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app); Migrate(app, db)

socketio = SocketIO(
    app,
    cors_allowed_origins=ORIGINS,
    async_mode="eventlet",
    transports=["websocket"],
    allow_upgrades=False,
    logger=True, engineio_logger=True,
    ping_timeout=30, ping_interval=20,
)

@socketio.on("connect")
def on_connect():
    app.logger.info(f"WS connect sid={request.sid}")
    emit("server:welcome", {"msg": "connected"})

@socketio.on("disconnect")
def on_disconnect():
    app.logger.info(f"WS disconnect sid={request.sid}")

@socketio.on("job:join")
def on_job_join(data):
    jid = (data or {}).get("job_id")
    app.logger.info(f"WS join sid={request.sid} job_id={jid}")
    if jid:
        join_room(f"job:{jid}")
        emit("chat:system", {"msg": f"joined job:{jid}"})

def emit_job_events(p: dict):
    if not isinstance(p, dict):
        app.logger.warning("emit_job_events non-dict"); return
    jid = p.get("id")
    if jid is None:
        app.logger.warning("emit_job_events missing id"); return
    app.logger.info(f"Emit job events id={jid}")
    socketio.emit("job:updated", p, room=f"job:{jid}")
    socketio.emit("job:list:changed", {"id": jid})

app.emit_job_events = emit_job_events
#emit data change to graph
def emit_metric_update(payload: dict):
    socketio.emit("metrics:hours:changed", payload)
app.emit_metric_update = emit_metric_update


from routes.job_routes import job_routes
from routes.user_routes import user_routes
from routes.machine_routes import machine_routes
app.register_blueprint(job_routes); app.register_blueprint(user_routes); app.register_blueprint(machine_routes)
app.register_blueprint(metrics_routes)
app.register_blueprint(job_pdf_routes)

@app.get("/health")
def health():
    app.logger.info("Health check"); return {"ok": True}, 200

@app.get("/")
def index():
    return {"message": "API is running."}, 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.logger.info(f"Starting Flask-SocketIO on http://0.0.0.0:{port} (path:/socket.io)")
    app.logger.info(f"Origins: {ORIGINS}")
    app.logger.info(f"DB URI : {app.config['SQLALCHEMY_DATABASE_URI']}")
    app.logger.info(f"Async  : {socketio.async_mode}")
    socketio.run(app, host="0.0.0.0", port=port, debug=False, use_reloader=False)
