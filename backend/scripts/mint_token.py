import sys
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import create_access_token
from datetime import timedelta
from app.core.config import settings

if __name__ == "__main__":
    # Accept email as command-line argument
    if len(sys.argv) < 2:
        print("Usage: python mint_token.py <email>")
        print("Example: python mint_token.py naveenvide@gmail.com")
        sys.exit(1)

    email = sys.argv[1]

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Error: User with email '{email}' not found")
            sys.exit(1)

        token = create_access_token(
            {"sub": str(user.id), "email": user.email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        print(f"Token for {email}:")
        print(token)
    finally:
        db.close()

