# seeders/seed_metrics.py
import random
from datetime import date, timedelta
from app.app import app
from models import db, User, HoursMetric

def seed_hours_metrics(days=15, max_hours=6.0, seed=42):
    with app.app_context():
        users = User.query.all()
        if not users:
            print("No users found – seed users first.")
            return

        random.seed(seed)
        start = date.today() - timedelta(days=days-1)
        rows = 0

        for u in users:
            role = (u.role or "contractor").lower()
            for i in range(days):
                d = start + timedelta(days=i)
                m = HoursMetric.query.filter_by(user_id=u.id, day=d).first()
                if not m:
                    m = HoursMetric(user_id=u.id, role=role, day=d)
                m.labour_hours = round(random.uniform(0.0, max_hours), 2)
                m.onsite_hours = round(random.uniform(0.0, max_hours), 2)
                db.session.add(m)
                rows += 1

        db.session.commit()
        print(f"Seeded/updated {rows} hours_metrics rows over {days} day(s) for {len(users)} user(s).")

if __name__ == "__main__":
    seed_hours_metrics()
