"""update video_progress to use topics

Revision ID: 003
Revises: 002
Create Date: 2025-01-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Drop the old video_progress table if it exists
    op.execute("DROP TABLE IF EXISTS video_progress CASCADE")
    
    # Create new video_progress table with topic_id
    op.create_table(
        'video_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('topic_id', sa.Integer(), nullable=False),
        sa.Column('watched_seconds', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('completed', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('last_position', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'topic_id', name='uq_user_topic_progress')
    )
    op.create_index(op.f('ix_video_progress_id'), 'video_progress', ['id'], unique=False)
    op.create_index(op.f('ix_video_progress_user_id'), 'video_progress', ['user_id'], unique=False)
    op.create_index(op.f('ix_video_progress_topic_id'), 'video_progress', ['topic_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_video_progress_topic_id'), table_name='video_progress')
    op.drop_index(op.f('ix_video_progress_user_id'), table_name='video_progress')
    op.drop_index(op.f('ix_video_progress_id'), table_name='video_progress')
    op.drop_table('video_progress')

