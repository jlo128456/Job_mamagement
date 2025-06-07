def seed_users():
    users = [
        User(id=1001, email="admin1@example.com", password=..., role="admin"),
        User(id=2001, email="jeffl@example.com", password=..., role="contractor"),
        User(id=2002, email="contractor2@example.com", password=..., role="contractor"),
        User(id=2003, email="contractor3@example.com", password=..., role="contractor"),
        User(id=6135, email="darren@example.com", password=..., role="technician"),
    ]
    db.session.add_all(users)
    db.session.flush()

    contractors = [u for u in users if u.role == "contractor"]
    technicians = [u for u in users if u.role == "technician"]
    return contractors, technicians