"""make payment package_id nullable

Revision ID: 005
Revises: 004
Create Date: 2025-01-15

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make package_id nullable to support individual course purchases
    op.alter_column('payments', 'package_id',
               existing_type=sa.INTEGER(),
               nullable=True)


def downgrade() -> None:
    # Revert package_id to NOT NULL
    op.alter_column('payments', 'package_id',
               existing_type=sa.INTEGER(),
               nullable=False)

