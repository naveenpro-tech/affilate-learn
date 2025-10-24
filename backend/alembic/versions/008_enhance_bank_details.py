"""enhance bank details with additional fields

Revision ID: 008
Revises: 007
Create Date: 2025-10-24

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '008'
down_revision = '007'
branch_labels = None
depends_on = None


def upgrade():
    # Add additional columns to bank_details table
    op.add_column('bank_details', sa.Column('branch_name', sa.String(length=200), nullable=True))
    op.add_column('bank_details', sa.Column('pan_number', sa.String(length=10), nullable=True))
    op.add_column('bank_details', sa.Column('gst_number', sa.String(length=15), nullable=True))
    op.add_column('bank_details', sa.Column('account_type', sa.String(length=50), nullable=True, server_default='Savings'))


def downgrade():
    # Remove additional columns
    op.drop_column('bank_details', 'account_type')
    op.drop_column('bank_details', 'gst_number')
    op.drop_column('bank_details', 'pan_number')
    op.drop_column('bank_details', 'branch_name')

