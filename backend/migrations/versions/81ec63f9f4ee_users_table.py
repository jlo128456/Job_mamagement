# migrations/versions/<rev1>_users_table.py
from alembic import op
import sqlalchemy as sa

revision = "rev_users"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(120), nullable=False, unique=True),
        sa.Column("password", sa.String(128), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("contractor", sa.String(100)),
    )

def downgrade():
    op.drop_table("users")
