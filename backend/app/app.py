# app/app.py
import os, sys, logging
ASYNC_MODE = os.getenv("SOCKET_ASYNC", "eventlet").lower()
if ASYNC_MODE == "eventlet":
    from eventlet import monkey_patch; monkey_patch()

from flask import Flask, request
from flask_cors import CORS
from flask_migrate import Migrate
from flask_socketio import SocketIO, emit, join_room
from sqlalchemy.pool import NullPool
from models import db
from routes.metrics_routes import metrics_routes
from routes.pdf_routes import job_pdf_routes
from routes.job_routes import job_routes
from routes.user_routes import user_routes
from routes.machine_routes import machine_routes

logging.basicConfig(level=logging.INFO, stream=sys.stdout, format='[%(asctime)s] %(levelname)s: %(message)s')
app = Flask(__name__); app.logger.setLevel(logging.INFO)

parse = lambda s: [o.strip() for o in s.split(",") if o.strip()] if s else []
DEFAULT_ORIGINS = ["http://localhost:3000","http://127.0.0.1:3000","https://jobmanagment1.netlify.app","https://job-mamagement.onrender.com"]
ORIGINS = parse(os.getenv("CORS_ORIGINS")) or DEFAULT_ORIGINS

app.config.update(SESSION_COOKIE_SAMESITE="None", SESSION_COOKIE_SECURE=True, SESSION_COOKIE_HTTPONLY=True)
CORS(app, supports_credentials=True, origins=ORIGINS,
     methods=["GET","POST","PUT","DELETE","OPTIONS","PATCH"],
     allow_headers=["Content-Type","Authorization","X-Requested-With","Accept"])

@app.after_request
def _add_cors_headers(resp):
    o = request.headers.get("Origin")
    if o and (o in ORIGINS or "*" in ORIGINS):
        h = resp.headers
        h["Access-Control-Allow-Origin"] = o; h["Access-Control-Allow-Credentials"] = "true"
        h.setdefault("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept")
        h.setdefault("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        h.setdefault("Access-Control-Max-Age", "86400"); h["Vary"] = "Origin"
    return resp

@app.route("/", defaults={"_": ""}, methods=["OPTIONS"])
@app.route("/<path:_>", methods=["OPTIONS"])
def _preflight(_): return ("", 204)

basedir = os.path.abspath(os.path.dirname(__file__))
local_db = f"sqlite:///{os.path.join(basedir,'database','job_management.db')}"
db_url = os.getenv("DATABASE_URL", local_db)
if db_url.startswith("postgres://"): db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
elif db_url.startswith("postgresql://") and "+psycopg" not in db_url: db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

app.config.update(SQLALCHEMY_DATABASE_URI=db_url, SQLALCHEMY_TRACK_MODIFICATIONS=False,
                  SQLALCHEMY_ENGINE_OPTIONS={"poolclass": NullPool})

db.init_app(app); Migrate(app, db)

socketio = SocketIO(app, async_mode=ASYNC_MODE, cors_allowed_origins=ORIGINS,
                    transports=["websocket","polling"], logger=True, engineio_logger=True,
                    ping_timeout=30, ping_interval=20, message_queue=os.getenv("REDIS_URL"))

@socketio.on("connect")
def on_connect(): app.logger.info(f"WS connect sid={request.sid}"); emit("server:welcome", {"msg":"connected"})

@socketio.on("disconnect")
def on_disconnect(): app.logger.info(f"WS disconnect sid={request.sid}")

@socketio.on("job:join")
def on_job_join(data):
    jid = (data or {}).get("job_id"); app.logger.info(f"WS join sid={request.sid} job_id={jid}")
    if jid: join_room(f"job:{jid}"); emit("chat:system", {"msg":f"joined job:{jid}"})

def emit_job_events(p: dict):
    if not isinstance(p, dict): app.logger.warning("emit_job_events non-dict"); return
    jid = p.get("id")
    if jid is None: app.logger.warning("emit_job_events missing id"); return
    app.logger.info(f"Emit job events id={jid}")
    socketio.emit("job:updated", p, room=f"job:{jid}"); socketio.emit("job:list:changed", {"id": jid})
app.emit_job_events = emit_job_events

def emit_metric_update(payload: dict): socketio.emit("metrics:hours:changed", payload)
app.emit_metric_update = emit_metric_update

for bp in (job_routes, user_routes, machine_routes, metrics_routes, job_pdf_routes): app.register_blueprint(bp)

@app.get("/health")
def health(): app.logger.info("Health check"); return {"ok": True}, 200

@app.get("/")
def index(): return {"message":"API is running."}, 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.logger.info(f"Starting Flask-SocketIO on http://0.0.0.0:{port} (path:/socket.io)")
    app.logger.info(f"Origins: {ORIGINS}")
    app.logger.info(f"DB URI : {app.config['SQLALCHEMY_DATABASE_URI']}")
    app.logger.info(f"Async  : {socketio.async_mode}")
    socketio.run(app, host="0.0.0.0", port=port, debug=False, use_reloader=False)
