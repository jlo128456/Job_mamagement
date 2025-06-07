# machine CRUD
from flask import Blueprint, request, jsonify
from models.models import db, Machine

machine_routes = Blueprint("machine_routes", __name__, url_prefix="/machines")

# Get all machines
@machine_routes.route("/", methods=["GET"])
def get_machines():
    machines = Machine.query.all()
    return jsonify([m.to_dict() for m in machines]), 200

# Get machine by ID
@machine_routes.route("/<int:machine_id>", methods=["GET"])
def get_machine(machine_id):
    machine = Machine.query.get(machine_id)
    if not machine:
        return jsonify({"error": "Machine not found"}), 404
    return jsonify(machine.to_dict()), 200

# Create a new machine
@machine_routes.route("/", methods=["POST"])
def create_machine():
    data = request.get_json()
    try:
        new_machine = Machine(
            machine_id=data["machine_id"],
            name=data["name"],
            type=data.get("type"),
            status=data.get("status", "available")
        )
        db.session.add(new_machine)
        db.session.commit()
        return jsonify(new_machine.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Update a machine
@machine_routes.route("/<int:machine_id>", methods=["PUT"])
def update_machine(machine_id):
    machine = Machine.query.get(machine_id)
    if not machine:
        return jsonify({"error": "Machine not found"}), 404

    data = request.get_json()
    try:
        machine.name = data.get("name", machine.name)
        machine.type = data.get("type", machine.type)
        machine.status = data.get("status", machine.status)
        db.session.commit()
        return jsonify(machine.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete a machine
@machine_routes.route("/<int:machine_id>", methods=["DELETE"])
def delete_machine(machine_id):
    machine = Machine.query.get(machine_id)
    if not machine:
        return jsonify({"error": "Machine not found"}), 404

    db.session.delete(machine)
    db.session.commit()
    return jsonify({"message": f"Machine {machine_id} deleted"}), 200