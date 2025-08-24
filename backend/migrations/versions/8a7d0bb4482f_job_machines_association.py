# migrations/versions/<rev4>_job_machines_table.py
from alembic import op
import sqlalchemy as sa

revision = "rev_job_machines"
down_revision = "rev_jobs"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "job_machines",
        sa.Column("job_id", sa.Integer, sa.ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("machine_id", sa.Integer, sa.ForeignKey("machines.id", ondelete="CASCADE"), primary_key=True),
    )

def downgrade():
    op.drop_table("job_machines")
