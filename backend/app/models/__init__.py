# Models module initialization
from app.models.user import User
from app.models.package import Package
from app.models.user_package import UserPackage
from app.models.referral import Referral
from app.models.commission import Commission
from app.models.payout import Payout
from app.models.course import Course
from app.models.video import Video
from app.models.payment import Payment

__all__ = [
    "User",
    "Package",
    "UserPackage",
    "Referral",
    "Commission",
    "Payout",
    "Course",
    "Video",
    "Payment",
]

