from models import db, Job, Machine
from datetime import datetime
from backports.zoneinfo import ZoneInfo  # Python 3.8 compatible

def seed_jobs_detailed(contractors, technicians):
    tz = ZoneInfo("Australia/Brisbane")

    def dt(date_str):
        return datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=tz)

    job_data = [
        {
            "work_order": "JM10001",
            "customer_name": "Tom's Tavern",
            "contractor": "JeffL",
            "role": "contractor",
            "required_date": "2025-03-05",
            "machines": ["MX100"],
            "customer_address": "108 Brown St, Waterford",
            "work_required": "System has not been serviced in over a year. General maintenance needed.",
        },
        {
            "work_order": "JM10002",
            "customer_name": "Sunny Bakery",
            "contractor": "JeffL",
            "role": "contractor",
            "required_date": "2025-03-23",
            "machines": ["MX200", "MX201"],
            "customer_address": "123 Main St, Jimboomba",
            "work_required": "Inspect electrical components for safety compliance.",
        },
        {
            "work_order": "JM10003",
            "customer_name": "Greenfield Apartments",
            "contractor": "JeffL",
            "role": "contractor",
            "required_date": "2025-03-31",
            "machines": ["MX202"],
            "customer_address": "150 John St, Jimboomba",
            "work_required": "Full diagnostic check before quarterly inspection. Update logs.",
        },
        {
            "work_order": "JM10004",
            "customer_name": "Greenbank RSL",
            "contractor": "Darren",
            "role": "technician",
            "required_date": "2025-03-25",
            "machines": ["MX300"],
            "customer_address": "54 Anzac Avenue, Hillcrest QLD 4118",
            "work_required": "Review onsite power supply unit for voltage irregularities.",
        },
    ]

    all_machines = {m.machine_id: m for m in Machine.query.all()}

    jobs = []
    for entry in job_data:
        job = Job(
            work_order=entry["work_order"],
            customer_name=entry["customer_name"],
            contractor=entry["contractor"],
            role=entry["role"],
            status="Pending",
            required_date=dt(entry["required_date"]),
            created_at=dt(entry["required_date"]),
            work_required=entry["work_required"],
            customer_address=entry["customer_address"],
            checklist_no_missing_screws=False,
            checklist_software_updated=False,
            checklist_tested=False,
            checklist_approved_by_management=False,
            signature="",
            contractor_status="Pending",
            onsite_time=None,
            contact_name="",
            work_performed="",
            travel_time="",
            labour_time="",
            note_count=0,
        )

        # Assign machines
        job.machines = [all_machines[mid] for mid in entry["machines"] if mid in all_machines]

        # Assign contractor or technician
        if job.role == "contractor":
            for c in contractors:
                if c.email.lower().startswith(job.contractor.lower()):
                    job.assigned_contractor = c.id
                    break
        else:
            for t in technicians:
                if t.email.lower().startswith(job.contractor.lower()):
                    job.assigned_tech = t.id
                    break

        jobs.append(job)

    db.session.add_all(jobs)
    db.session.commit()
