"""add notifications wallets and wallet_transactions tables

Revision ID: 001
Revises: 
Create Date: 2025-01-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Create notifications, wallets, and wallet_transactions tables"""
    
    # Create notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('link', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('read_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    
    # Create indexes for notifications
    op.create_index('ix_notifications_id', 'notifications', ['id'])
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('ix_notifications_is_read', 'notifications', ['is_read'])
    op.create_index('ix_notifications_created_at', 'notifications', ['created_at'])
    
    # Create wallets table
    op.create_table(
        'wallets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('balance', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('total_earned', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('total_withdrawn', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('total_spent', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id')
    )
    
    # Create indexes for wallets
    op.create_index('ix_wallets_id', 'wallets', ['id'])
    op.create_index('ix_wallets_user_id', 'wallets', ['user_id'], unique=True)
    
    # Create wallet_transactions table
    op.create_table(
        'wallet_transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('wallet_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.Enum('credit', 'debit', name='transactiontype'), nullable=False),
        sa.Column('source', sa.Enum('commission', 'payout', 'purchase', 'refund', 'admin', name='transactionsource'), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('balance_before', sa.Float(), nullable=False),
        sa.Column('balance_after', sa.Float(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('reference_id', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['wallet_id'], ['wallets.id'], ondelete='CASCADE')
    )
    
    # Create indexes for wallet_transactions
    op.create_index('ix_wallet_transactions_id', 'wallet_transactions', ['id'])
    op.create_index('ix_wallet_transactions_wallet_id', 'wallet_transactions', ['wallet_id'])
    op.create_index('ix_wallet_transactions_created_at', 'wallet_transactions', ['created_at'])
    op.create_index('ix_wallet_transactions_reference_id', 'wallet_transactions', ['reference_id'])


def downgrade():
    """Drop notifications, wallets, and wallet_transactions tables"""
    
    # Drop wallet_transactions table and indexes
    op.drop_index('ix_wallet_transactions_reference_id', table_name='wallet_transactions')
    op.drop_index('ix_wallet_transactions_created_at', table_name='wallet_transactions')
    op.drop_index('ix_wallet_transactions_wallet_id', table_name='wallet_transactions')
    op.drop_index('ix_wallet_transactions_id', table_name='wallet_transactions')
    op.drop_table('wallet_transactions')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS transactiontype')
    op.execute('DROP TYPE IF EXISTS transactionsource')
    
    # Drop wallets table and indexes
    op.drop_index('ix_wallets_user_id', table_name='wallets')
    op.drop_index('ix_wallets_id', table_name='wallets')
    op.drop_table('wallets')
    
    # Drop notifications table and indexes
    op.drop_index('ix_notifications_created_at', table_name='notifications')
    op.drop_index('ix_notifications_is_read', table_name='notifications')
    op.drop_index('ix_notifications_user_id', table_name='notifications')
    op.drop_index('ix_notifications_id', table_name='notifications')
    op.drop_table('notifications')

