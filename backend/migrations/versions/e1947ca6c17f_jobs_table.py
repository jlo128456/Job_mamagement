# migrations/versions/<rev3>_jobs_table.py
from alembic import op
import sqlalchemy as sa

revision = "rev_jobs"
down_revision = "rev_machines"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "jobs",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("work_order", sa.String(100), nullable=False, unique=True),
        sa.Column("customer_name", sa.String(100)),
        sa.Column("contractor", sa.String(100)),
        sa.Column("role", sa.String(20)),
        sa.Column("status", sa.String(50), server_default="Pending"),
        sa.Column("required_date", sa.DateTime()),
        sa.Column("completion_date", sa.DateTime()),
        sa.Column("status_timestamp", sa.DateTime()),
        sa.Column("onsite_time", sa.DateTime()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("checklist_no_missing_screws", sa.Boolean()),
        sa.Column("checklist_software_updated", sa.Boolean()),
        sa.Column("checklist_tested", sa.Boolean()),
        sa.Column("checklist_approved_by_management", sa.Boolean()),
        sa.Column("signature", sa.Text()),
        sa.Column("contractor_status", sa.String()),
        sa.Column("contact_name", sa.String()),
        sa.Column("work_required", sa.Text()),
        sa.Column("work_performed", sa.Text()),
        sa.Column("travel_time", sa.String()),
        sa.Column("labour_time", sa.String()),
        sa.Column("customer_address", sa.String()),
        sa.Column("note_count", sa.Integer()),
        sa.Column("assigned_contractor", sa.Integer, sa.ForeignKey("users.id")),
        sa.Column("assigned_tech", sa.Integer, sa.ForeignKey("users.id")),
    )
    op.create_index("ix_jobs_status", "jobs", ["status"])
    op.create_index("ix_jobs_assigned_contractor", "jobs", ["assigned_contractor"])
    op.create_index("ix_jobs_assigned_tech", "jobs", ["assigned_tech"])

def downgrade():
    op.drop_index("ix_jobs_assigned_tech", table_name="jobs")
    op.drop_index("ix_jobs_assigned_contractor", table_name="jobs")
    op.drop_index("ix_jobs_status", table_name="jobs")
    op.drop_table("jobs")
