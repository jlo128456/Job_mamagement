from flask import Blueprint, request, jsonify, current_app
from datetime import date, datetime
from models.models import db, HoursMetric, User

metrics_routes = Blueprint("metrics_routes", __name__, url_prefix="/metrics")

@metrics_routes.get("/hours")
def get_hours():
    q = HoursMetric.query
    frm = request.args.get("from"); to = request.args.get("to")
    if frm: q = q.filter(HoursMetric.day >= datetime.fromisoformat(frm).date())
    if to:  q = q.filter(HoursMetric.day <= datetime.fromisoformat(to).date())
    rows = [r.to_dict() for r in q.order_by(HoursMetric.day.asc()).all()]
    return jsonify(rows), 200

@metrics_routes.post("/hours")
def upsert_hours():
    d = request.get_json() or {}
    uid, role = d.get("user_id"), d.get("role")
    day = datetime.fromisoformat(d.get("day")).date() if d.get("day") else date.today()
    if not uid or not role: return jsonify({"error":"user_id and role required"}), 400

    m = HoursMetric.query.filter_by(user_id=uid, day=day).first() or HoursMetric(user_id=uid, role=role, day=day)
    m.role = role
    m.labour_hours = float(d.get("labour_hours", m.labour_hours or 0))
    m.onsite_hours  = float(d.get("onsite_hours",  m.onsite_hours  or 0))
    db.session.add(m); db.session.commit()

    payload = m.to_dict()
    # notify charts live
    if hasattr(current_app, "emit_metric_update"):
        current_app.emit_metric_update(payload)
    return jsonify(payload), 200
