from flask import Blueprint, request, jsonify
from models.models import db, User

user_routes = Blueprint("user_routes", __name__, url_prefix="/users")

# GET all users or POST new user
@user_routes.route("/", methods=["GET", "POST"], strict_slashes=False)
def list_or_create_users():
    if request.method == "GET":
        users = User.query.all()
        return jsonify([u.to_dict() for u in users]), 200

    data = request.get_json() or {}
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

# GET, PUT, DELETE individual user
@user_routes.route("/<int:user_id>", methods=["GET", "PUT", "DELETE"], strict_slashes=False)
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

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"User {user_id} deleted"}), 200

# GET contractors and technicians
@user_routes.route("/staff", methods=["GET"])
def get_staff():
    users = User.query.filter(User.role.in_(["contractor", "technician"])).all()
    return jsonify([u.to_dict() for u in users]), 200

# POST login
@user_routes.route("/login", methods=["POST"], strict_slashes=False)
def login_user():
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get("email")).first()
    if not user or not user.check_password(data.get("password")):
        return jsonify({"error": "Invalid credentials"}), 401
    return jsonify(user.to_dict()), 200

# POST forgot password (mock only)
@user_routes.route("/forgot-password", methods=["POST"], strict_slashes=False)
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email")

    if not email:
        return jsonify({"error": "Missing email"}), 400

    user = User.query.filter_by(email=email).first()
    print(f"[demo] Sending reset link to {email}")
    return jsonify({"message": "If that account exists, a reset link has been sent."}), 200
