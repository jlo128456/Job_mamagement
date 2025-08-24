# migrations/versions/<rev5>_hours_metrics_table.py
from alembic import op
import sqlalchemy as sa

revision = "rev_hours_metrics"
down_revision = "rev_job_machines"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "hours_metrics",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),   # "contractor" | "technician"
        sa.Column("day", sa.Date, nullable=False),
        sa.Column("onsite_hours", sa.Float(), server_default="0"),
        sa.Column("labour_hours", sa.Float(), server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("user_id", "day", name="uq_hours_metrics_user_day"),
    )
    op.create_index("ix_hours_metrics_day", "hours_metrics", ["day"])

def downgrade():
    op.drop_index("ix_hours_metrics_day", table_name="hours_metrics")
    op.drop_table("hours_metrics")
