from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import create_access_token
from datetime import timedelta
from app.core.config import settings

if __name__ == "__main__":
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email=="naveenvide@gmail.com").first()
        assert user, "Admin user not found"
        token = create_access_token({"sub": str(user.id), "email": user.email}, expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
        print(token)
    finally:
        db.close()

