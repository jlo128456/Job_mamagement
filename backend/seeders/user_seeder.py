from models import db, User
from werkzeug.security import generate_password_hash

def seed_users():
    users = [
        User(id=1001, email="admin1@example.com", password=generate_password_hash("admin123"), role="admin"),

        User(id=2001, email="jeffl@example.com", password=generate_password_hash("contractor123"),
             role="contractor", contractor="JeffL"),

        User(id=2002, email="contractor2@example.com", password=generate_password_hash("contractor123"),
             role="contractor", contractor="Contractor 2"),

        User(id=2003, email="contractor3@example.com", password=generate_password_hash("contractor123"),
             role="contractor", contractor="Contractor 3"),

        User(id=6135, email="darren@example.com", password=generate_password_hash("tech123"),
             role="technician", contractor="Darren"),
    ]

    db.session.add_all(users)
    db.session.flush()

    contractors = [u for u in users if u.role == "contractor"]
    technicians = [u for u in users if u.role == "technician"]
    return contractors, technicians
