# machine CRUD
from flask import Blueprint, request, jsonify, current_app
from models.models import db, Machine

machine_routes = Blueprint("machine_routes", __name__, url_prefix="/machines")

def _sock():
    return current_app.extensions.get("socketio")

def _emit_updated(m):
    s = _sock()
    if s and m:
        p = m.to_dict()
        s.emit("machine:updated", p, room=f"machine:{m.machine_id}")
        s.emit("machine:list:changed", {"id": m.machine_id, "op": "update"}, broadcast=True)

def _emit_list(op, mid):
    s = _sock()
    if s:
        s.emit("machine:list:changed", {"id": mid, "op": op}, broadcast=True)

# Get all machines
@machine_routes.route("/", methods=["GET"])
def get_machines():
    return jsonify([m.to_dict() for m in Machine.query.all()]), 200

# Get machine by ID
@machine_routes.route("/<int:machine_id>", methods=["GET"])
def get_machine(machine_id):
    m = Machine.query.get(machine_id)
    return (jsonify(m.to_dict()), 200) if m else (jsonify({"error": "Machine not found"}), 404)

# Create a new machine
@machine_routes.route("/", methods=["POST"])
def create_machine():
    d = request.get_json() or {}
    try:
        m = Machine(
            machine_id=d["machine_id"],
            name=d["name"],
            type=d.get("type"),
            status=d.get("status", "available"),
        )
        db.session.add(m); db.session.commit()
        _emit_list("create", m.machine_id); _emit_updated(m)
        return jsonify(m.to_dict()), 201
    except Exception as e:
        db.session.rollback(); return jsonify({"error": str(e)}), 400

# Update a machine
@machine_routes.route("/<int:machine_id>", methods=["PUT"])
def update_machine(machine_id):
    m = Machine.query.get(machine_id)
    if not m: return jsonify({"error": "Machine not found"}), 404
    d = request.get_json() or {}
    try:
        m.name = d.get("name", m.name)
        m.type = d.get("type", m.type)
        m.status = d.get("status", m.status)
        db.session.commit()
        _emit_updated(m)
        return jsonify(m.to_dict()), 200
    except Exception as e:
        db.session.rollback(); return jsonify({"error": str(e)}), 400

# Delete a machine
@machine_routes.route("/<int:machine_id>", methods=["DELETE"])
def delete_machine(machine_id):
    m = Machine.query.get(machine_id)
    if not m: return jsonify({"error": "Machine not found"}), 404
    db.session.delete(m); db.session.commit()
    _emit_list("delete", machine_id)
    return jsonify({"message": f"Machine {machine_id} deleted"}), 200
