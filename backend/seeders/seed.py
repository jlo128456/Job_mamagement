import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.app import app
from models import db  # Importing from the package root
from seeders.user_seeder import seed_users
from seeders.job_seeder import seed_jobs_detailed
from seeders.machine_seeder import seed_machines

def run_seed():
    with app.app_context():
        db.drop_all()
        db.create_all()

        contractors, technicians = seed_users()
        seed_jobs_detailed(contractors, technicians)
        seed_machines()

        db.session.commit()
        print("Database seeded successfully.")

if __name__ == "__main__":
    run_seed()
