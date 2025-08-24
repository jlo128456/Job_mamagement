# seed_metrics.py
import random
from datetime import date, timedelta
from app.app import app
from models import db, User, HoursMetric

with app.app_context():
    users = User.query.all()
    if not users:
        print("No users found – seed users first."); raise SystemExit(1)

    start = date.today() - timedelta(days=14)
    rows = 0
    for u in users:
        role = u.role or "contractor"
        for i in range(15):
            day = start + i * timedelta(days=1)
            m = HoursMetric.query.filter_by(user_id=u.id, day=day).first()
            if not m:
                m = HoursMetric(user_id=u.id, role=role, day=day)
            m.labour_hours = round(random.uniform(0.0, 6.0), 2)
            m.onsite_hours  = round(random.uniform(0.0, 6.0), 2)
            db.session.add(m); rows += 1
    db.session.commit()
    print(f"Seeded/updated {rows} hours_metrics rows.")
