from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.core.database import engine


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str,
    link: str = None,
    post_id: int = None,
    comment_id: int = None,
    from_user_id: int = None,
):
    """
    Create a notification for a user
    """
    # Ensure table exists
    Notification.__table__.create(bind=engine, checkfirst=True)
    
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
        link=link,
        post_id=post_id,
        comment_id=comment_id,
        from_user_id=from_user_id,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def notify_post_liked(db: Session, post_owner_id: int, liker_name: str, post_id: int, from_user_id: int):
    """
    Notify user when their post is liked
    """
    return create_notification(
        db=db,
        user_id=post_owner_id,
        title="New Like",
        message=f"{liker_name} liked your post",
        notification_type="like",
        link=f"/studio/community/{post_id}",
        post_id=post_id,
        from_user_id=from_user_id,
    )


def notify_post_commented(db: Session, post_owner_id: int, commenter_name: str, post_id: int, comment_id: int, from_user_id: int):
    """
    Notify user when someone comments on their post
    """
    return create_notification(
        db=db,
        user_id=post_owner_id,
        title="New Comment",
        message=f"{commenter_name} commented on your post",
        notification_type="comment",
        link=f"/studio/community/{post_id}",
        post_id=post_id,
        comment_id=comment_id,
        from_user_id=from_user_id,
    )


def notify_post_remixed(db: Session, post_owner_id: int, remixer_name: str, post_id: int, from_user_id: int):
    """
    Notify user when their post is remixed
    """
    return create_notification(
        db=db,
        user_id=post_owner_id,
        title="Post Remixed",
        message=f"{remixer_name} remixed your post",
        notification_type="remix",
        link=f"/studio/community/{post_id}",
        post_id=post_id,
        from_user_id=from_user_id,
    )


def notify_credit_reward(db: Session, user_id: int, amount: int, reason: str):
    """
    Notify user when they receive credit rewards
    """
    return create_notification(
        db=db,
        user_id=user_id,
        title="Credit Reward",
        message=f"You earned {amount} credits! {reason}",
        notification_type="credit_reward",
        link="/studio/my-creations",
    )


def notify_milestone(db: Session, user_id: int, milestone: str, reward: int):
    """
    Notify user when they reach a milestone
    """
    return create_notification(
        db=db,
        user_id=user_id,
        title="Milestone Achieved!",
        message=f"Congratulations! {milestone}. You earned {reward} credits!",
        notification_type="milestone",
        link="/studio/my-creations",
    )

