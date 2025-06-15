# User auth + CRUD
from flask import Blueprint, request, jsonify
from models.models import db, User
from werkzeug.security import generate_password_hash, check_password_hash

user_routes = Blueprint(
    "user_routes",
    __name__,
    url_prefix="/users",
    strict_slashes=False  #  Accept both /users and /users/
)

# Get all users
@user_routes.route("/", methods=["GET", "POST"])
def list_or_create_users():
    if request.method == "GET":
        users = User.query.all()
        return jsonify([u.to_dict() for u in users]), 200

    # POST: register new user
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

# Supporting separate /<id> endpoints:
@user_routes.route("/<int:user_id>", methods=["GET", "PUT", "DELETE"])
def user_detail(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if request.method == "GET":
        return jsonify(user.to_dict()), 200

    data = request.get_json() or {}
    if request.method == "PUT":
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

    # DELETE
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"User {user_id} deleted"}), 200

# Login endpoint
@user_routes.route("/login", methods=["POST"])
def login_user():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify(user.to_dict()), 200
