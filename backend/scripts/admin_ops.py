from app.core.database import SessionLocal
from app.models.user import User
from app.services.credit_ledger_service import CreditLedgerService


def promote_admin(email: str) -> str:
    db = SessionLocal()
    try:
        u = db.query(User).filter(User.email == email).first()
        if not u:
            return f"User {email} not found"
        if not u.is_admin:
            u.is_admin = True
            db.commit()
            return f"Promoted {email} to admin"
        return f"{email} already admin"
    finally:
        db.close()


def grant_credits(email: str, amount: int, ref_id: str) -> str:
    db = SessionLocal()
    try:
        u = db.query(User).filter(User.email == email).first()
        if not u:
            return f"User {email} not found"
        res = CreditLedgerService.credit_credits(db, u.id, amount, reason="admin_grant", ref_id=ref_id)
        return f"Grant credits result for {email}: {res}"
    finally:
        db.close()


if __name__ == "__main__":
    print(promote_admin("naveenvide2@gmail.com"))
    print(grant_credits("naveenvide@gmail.com", 50, "admin-grant-50"))

