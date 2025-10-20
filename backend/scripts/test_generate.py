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
    url = "http://localhost:8000/api/studio/generate"
    body = {"prompt": "A photorealistic portrait of a golden retriever wearing sunglasses", "tier": "standard", "watermark": False}
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            print(resp.read().decode("utf-8"))
    except Exception as e:
        import sys
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))
        else:
            print(str(e), file=sys.stderr)

