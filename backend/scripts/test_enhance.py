import json, urllib.request
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import create_access_token
from datetime import timedelta
from app.core.config import settings

def get_token():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email=="naveenvide@gmail.com").first()
        token = create_access_token({"sub": str(user.id), "email": user.email}, expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
        return token
    finally:
        db.close()

if __name__ == "__main__":
    token = get_token()
    url = "http://localhost:8000/api/studio/enhance-prompt"
    body = {"prompt": "A beautiful mountain landscape at sunset with vibrant colors"}
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        print(resp.read().decode("utf-8"))

