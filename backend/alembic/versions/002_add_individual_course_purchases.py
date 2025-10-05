"""add individual course purchases

Revision ID: 002
Revises: 001
Create Date: 2025-01-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Add individual_price and available_for_individual_purchase to courses table
    op.add_column('courses', sa.Column('individual_price', sa.Float(), nullable=True, server_default='199.0'))
    op.add_column('courses', sa.Column('available_for_individual_purchase', sa.Boolean(), nullable=False, server_default='true'))
    
    # Create user_course_purchases table
    op.create_table(
        'user_course_purchases',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('amount_paid', sa.Float(), nullable=False),
        sa.Column('payment_id', sa.Integer(), nullable=True),
        sa.Column('purchase_date', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('access_expires_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ),
        sa.ForeignKeyConstraint(['payment_id'], ['payments.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'course_id', name='uq_user_course')
    )
    
    # Create indexes
    op.create_index('ix_user_course_purchases_user_id', 'user_course_purchases', ['user_id'])
    op.create_index('ix_user_course_purchases_course_id', 'user_course_purchases', ['course_id'])
    op.create_index('ix_user_course_purchases_is_active', 'user_course_purchases', ['is_active'])


def downgrade():
    # Drop indexes
    op.drop_index('ix_user_course_purchases_is_active', table_name='user_course_purchases')
    op.drop_index('ix_user_course_purchases_course_id', table_name='user_course_purchases')
    op.drop_index('ix_user_course_purchases_user_id', table_name='user_course_purchases')
    
    # Drop table
    op.drop_table('user_course_purchases')
    
    # Remove columns from courses
    op.drop_column('courses', 'available_for_individual_purchase')
    op.drop_column('courses', 'individual_price')

