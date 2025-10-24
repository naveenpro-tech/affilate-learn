"""create invoices table

Revision ID: 009
Revises: 008
Create Date: 2025-10-24

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime


# revision identifiers, used by Alembic.
revision = '009'
down_revision = '008'
branch_labels = None
depends_on = None


def upgrade():
    # Create invoices table
    op.create_table(
        'invoices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('invoice_number', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('payment_id', sa.Integer(), nullable=False),
        sa.Column('invoice_type', sa.String(length=20), nullable=False),
        sa.Column('item_name', sa.String(length=200), nullable=False),
        sa.Column('item_description', sa.Text(), nullable=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('gst_percentage', sa.Float(), nullable=True, server_default='18.0'),
        sa.Column('gst_amount', sa.Float(), nullable=False),
        sa.Column('total_amount', sa.Float(), nullable=False),
        sa.Column('invoice_date', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('pdf_url', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['payment_id'], ['payments.id'], ),
    )
    
    # Create indexes
    op.create_index(op.f('ix_invoices_id'), 'invoices', ['id'], unique=False)
    op.create_index(op.f('ix_invoices_invoice_number'), 'invoices', ['invoice_number'], unique=True)
    op.create_index(op.f('ix_invoices_user_id'), 'invoices', ['user_id'], unique=False)
    op.create_index(op.f('ix_invoices_payment_id'), 'invoices', ['payment_id'], unique=False)


def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_invoices_payment_id'), table_name='invoices')
    op.drop_index(op.f('ix_invoices_user_id'), table_name='invoices')
    op.drop_index(op.f('ix_invoices_invoice_number'), table_name='invoices')
    op.drop_index(op.f('ix_invoices_id'), table_name='invoices')
    
    # Drop table
    op.drop_table('invoices')

