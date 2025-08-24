# migrations/versions/<rev2>_machines_table.py
from alembic import op
import sqlalchemy as sa

revision = "rev_machines"
down_revision = "rev_users"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "machines",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("machine_id", sa.String(50), nullable=False, unique=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("type", sa.String(50)),
        sa.Column("status", sa.String(50)),
    )

def downgrade():
    op.drop_table("machines")
