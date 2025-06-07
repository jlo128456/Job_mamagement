# User auth + CRUD
from flask import Blueprint, request, jsonify
from models.models import db, User
from werkzeug.security import generate_password_hash, check_password_hash

user_routes = Blueprint("user_routes", __name__, url_prefix="/users")

# Get all users
@user_routes.route("/", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

# Get single user by ID
@user_routes.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200

# Register new user
@user_routes.route("/", methods=["POST"])
def create_user():
    data = request.get_json()
    try:
        new_user = User(
            email=data["email"],
            role=data["role"],
            contractor=data.get("contractor")
        )
        new_user.set_password(data["password"])
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Update user
@user_routes.route("/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    try:
        user.email = data.get("email", user.email)
        user.role = data.get("role", user.role)
        user.contractor = data.get("contractor", user.contractor)
        if "password" in data:
            user.set_password(data["password"])
        db.session.commit()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete user
@user_routes.route("/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"User {user_id} deleted"}), 200