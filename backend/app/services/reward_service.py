from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.studio import CommunityPost, CreditLedger
from app.models.user import User
from app.services.notification_service import notify_credit_reward, notify_milestone
from app.core.database import engine
import logging

logger = logging.getLogger(__name__)


def award_credits(
    db: Session,
    user_id: int,
    amount: int,
    reason: str,
    reference_type: str = "reward",
    reference_id: int = None,
):
    """
    Award credits to a user and create ledger entry
    """
    try:
        # Ensure table exists
        CreditLedger.__table__.create(bind=engine, checkfirst=True)
        
        # Update user balance
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"User {user_id} not found")
            return None
        
        user.credits_balance = (user.credits_balance or 0) + amount
        
        # Create ledger entry
        ledger = CreditLedger(
            user_id=user_id,
            amount=amount,
            transaction_type="reward",
            description=reason,
            reference_type=reference_type,
            reference_id=reference_id,
        )
        db.add(ledger)
        db.commit()
        db.refresh(user)
        
        # Send notification
        try:
            notify_credit_reward(db, user_id, amount, reason)
        except Exception as e:
            logger.warning(f"Failed to send credit reward notification: {e}")
        
        return ledger
        
    except Exception as e:
        logger.error(f"Failed to award credits: {e}")
        db.rollback()
        return None


def check_first_post_reward(db: Session, user_id: int):
    """
    Check if user published their first post and award credits
    """
    try:
        post_count = db.query(func.count(CommunityPost.id)).filter(
            CommunityPost.user_id == user_id
        ).scalar()
        
        if post_count == 1:
            # First post! Award 50 credits
            award_credits(
                db=db,
                user_id=user_id,
                amount=50,
                reason="First post published!",
                reference_type="first_post",
            )
            logger.info(f"Awarded first post reward to user {user_id}")
            
    except Exception as e:
        logger.error(f"Failed to check first post reward: {e}")


def check_post_milestone_rewards(db: Session, user_id: int):
    """
    Check if user reached post milestones (10, 50, 100 posts)
    """
    try:
        post_count = db.query(func.count(CommunityPost.id)).filter(
            CommunityPost.user_id == user_id
        ).scalar()
        
        milestones = {
            10: 100,   # 10 posts = 100 credits
            50: 500,   # 50 posts = 500 credits
            100: 1000, # 100 posts = 1000 credits
        }
        
        for milestone, reward in milestones.items():
            if post_count == milestone:
                award_credits(
                    db=db,
                    user_id=user_id,
                    amount=reward,
                    reason=f"{milestone} posts milestone!",
                    reference_type="milestone",
                )
                
                # Send milestone notification
                try:
                    notify_milestone(
                        db=db,
                        user_id=user_id,
                        milestone=f"You've published {milestone} posts",
                        reward=reward
                    )
                except Exception as e:
                    logger.warning(f"Failed to send milestone notification: {e}")
                
                logger.info(f"Awarded {milestone} posts milestone reward to user {user_id}")
                
    except Exception as e:
        logger.error(f"Failed to check post milestone rewards: {e}")


def check_likes_milestone_reward(db: Session, post_id: int):
    """
    Check if post reached 100 likes and award credits to owner
    """
    try:
        post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
        if not post:
            return
        
        # Check if exactly 100 likes (to avoid duplicate rewards)
        if post.likes_count == 100:
            award_credits(
                db=db,
                user_id=post.user_id,
                amount=200,
                reason="Your post reached 100 likes!",
                reference_type="likes_milestone",
                reference_id=post_id,
            )
            
            # Send milestone notification
            try:
                notify_milestone(
                    db=db,
                    user_id=post.user_id,
                    milestone="Your post reached 100 likes",
                    reward=200
                )
            except Exception as e:
                logger.warning(f"Failed to send likes milestone notification: {e}")
            
            logger.info(f"Awarded 100 likes milestone reward for post {post_id}")
            
    except Exception as e:
        logger.error(f"Failed to check likes milestone reward: {e}")


def check_daily_login_reward(db: Session, user_id: int):
    """
    Check if user should receive daily login reward
    """
    try:
        from datetime import datetime, timedelta
        
        # Check if user already received daily reward today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        existing_reward = db.query(CreditLedger).filter(
            CreditLedger.user_id == user_id,
            CreditLedger.reference_type == "daily_login",
            CreditLedger.created_at >= today_start
        ).first()
        
        if not existing_reward:
            # Award daily login reward
            award_credits(
                db=db,
                user_id=user_id,
                amount=10,
                reason="Daily login bonus",
                reference_type="daily_login",
            )
            logger.info(f"Awarded daily login reward to user {user_id}")
            return True
        
        return False
        
    except Exception as e:
        logger.error(f"Failed to check daily login reward: {e}")
        return False

