"""add address fields to users table

Revision ID: 007
Revises: 006
Create Date: 2025-10-24

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '007'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade():
    # Add address columns to users table
    op.add_column('users', sa.Column('address_line1', sa.String(length=200), nullable=True))
    op.add_column('users', sa.Column('address_line2', sa.String(length=200), nullable=True))
    op.add_column('users', sa.Column('city', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('state', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('postal_code', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('country', sa.String(length=100), nullable=True, server_default='India'))


def downgrade():
    # Remove address columns
    op.drop_column('users', 'country')
    op.drop_column('users', 'postal_code')
    op.drop_column('users', 'state')
    op.drop_column('users', 'city')
    op.drop_column('users', 'address_line2')
    op.drop_column('users', 'address_line1')

