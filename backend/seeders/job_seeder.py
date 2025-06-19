from models.models import db, Job
from datetime import datetime
from backports.zoneinfo import ZoneInfo  # Use backport for Python 3.8
import json

def seed_jobs_detailed(contractors, technicians):
    tz = ZoneInfo("Australia/Brisbane")

    def dt(date_str):
        return datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=tz)

    jobs = [
        Job(
            work_order="JM10001",
            customer_name="Tom's Tavern",
            contractor="JeffL",
            role="contractor",
            status="Pending",
            machines=json.dumps(['MX100']),
            completion_date=None,
            required_date=dt("2025-03-05"),
            checklist_no_missing_screws=False,
            checklist_software_updated=False,
            checklist_tested=False,
            checklist_approved_by_management=False,
            signature="",
            status_timestamp=None,
            contractor_status="Pending",
            onsite_time=None,
            contact_name="",
            work_required="System has not been serviced in over a year. General maintenance needed.",
            work_performed="",
            travel_time="",
            labour_time="",
            created_at=datetime(2025, 3, 5, 9, 0, tzinfo=tz),
            assigned_contractor=None,
            assigned_tech=None,
            customer_address="108 Brown St, Waterford",
            note_count=0,
        ),
        Job(
            work_order="JM10002",
            customer_name="Sunny Bakery",
            contractor="JeffL",
            role="contractor",
            status="Pending",
            machines=json.dumps(['MX200', 'MX201']),
            completion_date=None,
            required_date=dt("2025-03-23"),
            checklist_no_missing_screws=False,
            checklist_software_updated=False,
            checklist_tested=False,
            checklist_approved_by_management=False,
            signature="",
            status_timestamp=None,
            contractor_status=None,
            onsite_time=None,
            contact_name="",
            work_required="Inspect electrical components for safety compliance.",
            work_performed="",
            travel_time="",
            labour_time="",
            created_at=datetime(2025, 3, 5, 11, 0, tzinfo=tz),
            assigned_contractor=None,
            assigned_tech=None,
            customer_address="123 Main St, Jimboomba",
            note_count=0,
        ),
        Job(
            work_order="JM10003",
            customer_name="Greenfield Apartments",
            contractor="JeffL",
            role="contractor",
            status="Pending",
            machines=json.dumps(['MX202']),
            completion_date=None,
            required_date=dt("2025-03-31"),
            checklist_no_missing_screws=False,
            checklist_software_updated=False,
            checklist_tested=False,
            checklist_approved_by_management=False,
            signature="",
            status_timestamp=None,
            contractor_status="",
            onsite_time=None,
            contact_name="",
            work_required="Full diagnostic check before quarterly inspection. Update logs.",
            work_performed="",
            travel_time="",
            labour_time="",
            created_at=datetime(2025, 3, 5, 14, 15, tzinfo=tz),
            assigned_contractor=None,
            assigned_tech=None,
            customer_address="150 John St, Jimboomba",
            note_count=0,
        ),
        Job(
            work_order="JM10004",
            customer_name="Greenbank RSL",
            contractor="Darren",
            role="technician",
            status="Pending",
            machines=json.dumps(['MX300']),
            completion_date=None,
            required_date=dt("2025-03-25"),
            checklist_no_missing_screws=None,
            checklist_software_updated=None,
            checklist_tested=None,
            checklist_approved_by_management=None,
            signature=None,
            status_timestamp=None,
            contractor_status=None,
            onsite_time=None,
            contact_name=None,
            work_required="Review onsite power supply unit for voltage irregularities.",
            work_performed=None,
            travel_time=None,
            labour_time=None,
            created_at=datetime(2025, 3, 7, 11, 37, 46, tzinfo=tz),
            assigned_contractor=None,
            assigned_tech=None,
            customer_address="54 Anzac Avenue, Hillcrest QLD 4118",
            note_count=0,
        ),
    ]

    # Assign user IDs
    for job in jobs:
        if job.role == "contractor":
            for contractor in contractors:
                if contractor.email.lower().startswith(job.contractor.lower()):
                    job.assigned_contractor = contractor.id
                    break
        elif job.role == "technician":
            for tech in technicians:
                if tech.email.lower().startswith(job.contractor.lower()):
                    job.assigned_tech = tech.id
                    break

    db.session.add_all(jobs)
