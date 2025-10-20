"""
Credit Ledger Service
Manages credit transactions, balances, and rewards
"""

import logging
import uuid
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import CreditLedger, User
from app.core.config import settings

logger = logging.getLogger(__name__)


class CreditLedgerService:
    """Service for managing credit transactions and balances"""
    
    @staticmethod
    def debit_credits(
        db: Session,
        user_id: int,
        amount: float,
        reason: str,
        ref_id: Optional[str] = None,
        idempotency_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Debit credits from user account (idempotent)
        Returns: {success, balance, transaction_id, error?}
        """
        try:
            # Generate idempotency key if not provided
            if not idempotency_key:
                idempotency_key = f"{user_id}-{reason}-{ref_id}-{uuid.uuid4()}"
            
            # Check if transaction already exists (idempotency)
            existing = db.query(CreditLedger).filter(
                CreditLedger.idempotency_key == idempotency_key
            ).first()
            
            if existing:
                logger.info(f"Idempotent transaction already exists: {idempotency_key}")
                balance = CreditLedgerService.get_balance(db, user_id)
                return {
                    "success": True,
                    "balance": balance,
                    "transaction_id": existing.id,
                    "idempotent": True,
                }
            
            # Check balance
            current_balance = CreditLedgerService.get_balance(db, user_id)
            if current_balance < amount:
                logger.warning(f"Insufficient credits: user={user_id}, need={amount}, have={current_balance}")
                return {
                    "success": False,
                    "balance": current_balance,
                    "error": "Insufficient credits",
                }
            
            # Create ledger entry
            ledger_entry = CreditLedger(
                user_id=user_id,
                delta=-amount,  # Negative for debit
                reason=reason,
                ref_id=ref_id,
                idempotency_key=idempotency_key,
            )
            db.add(ledger_entry)
            db.commit()
            db.refresh(ledger_entry)
            
            new_balance = CreditLedgerService.get_balance(db, user_id)
            logger.info(f"Credits debited: user={user_id}, amount={amount}, new_balance={new_balance}")
            
            return {
                "success": True,
                "balance": new_balance,
                "transaction_id": ledger_entry.id,
            }
            
        except Exception as e:
            logger.error(f"Error debiting credits: {e}")
            db.rollback()
            return {
                "success": False,
                "error": str(e),
            }
    
    @staticmethod
    def credit_credits(
        db: Session,
        user_id: int,
        amount: float,
        reason: str,
        ref_id: Optional[str] = None,
        idempotency_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Credit credits to user account (idempotent)
        Returns: {success, balance, transaction_id, error?}
        """
        try:
            # Generate idempotency key if not provided
            if not idempotency_key:
                idempotency_key = f"{user_id}-{reason}-{ref_id}-{uuid.uuid4()}"
            
            # Check if transaction already exists (idempotency)
            existing = db.query(CreditLedger).filter(
                CreditLedger.idempotency_key == idempotency_key
            ).first()
            
            if existing:
                logger.info(f"Idempotent transaction already exists: {idempotency_key}")
                balance = CreditLedgerService.get_balance(db, user_id)
                return {
                    "success": True,
                    "balance": balance,
                    "transaction_id": existing.id,
                    "idempotent": True,
                }
            
            # Create ledger entry
            ledger_entry = CreditLedger(
                user_id=user_id,
                delta=amount,  # Positive for credit
                reason=reason,
                ref_id=ref_id,
                idempotency_key=idempotency_key,
            )
            db.add(ledger_entry)
            db.commit()
            db.refresh(ledger_entry)
            
            new_balance = CreditLedgerService.get_balance(db, user_id)
            logger.info(f"Credits credited: user={user_id}, amount={amount}, new_balance={new_balance}")
            
            return {
                "success": True,
                "balance": new_balance,
                "transaction_id": ledger_entry.id,
            }
            
        except Exception as e:
            logger.error(f"Error crediting credits: {e}")
            db.rollback()
            return {
                "success": False,
                "error": str(e),
            }
    
    @staticmethod
    def get_balance(db: Session, user_id: int) -> float:
        """Get current credit balance for user"""
        try:
            result = db.query(CreditLedger).filter(
                CreditLedger.user_id == user_id
            ).all()
            
            balance = sum(entry.delta for entry in result)
            return max(0, balance)  # Never negative
            
        except Exception as e:
            logger.error(f"Error getting balance: {e}")
            return 0.0
    
    @staticmethod
    def get_tier_cost(tier: str) -> int:
        """Get credit cost for generation tier"""
        costs = {
            "standard": settings.CREDIT_STANDARD_TIER_COST,
            "premium2": settings.CREDIT_PREMIUM_TIER_2_COST,
            "premium4": settings.CREDIT_PREMIUM_TIER_4_COST,
        }
        return costs.get(tier, settings.CREDIT_STANDARD_TIER_COST)
    
    @staticmethod
    def get_ledger_history(db: Session, user_id: int, limit: int = 50) -> list:
        """Get credit transaction history for user"""
        try:
            entries = db.query(CreditLedger).filter(
                CreditLedger.user_id == user_id
            ).order_by(CreditLedger.created_at.desc()).limit(limit).all()
            
            return [
                {
                    "id": e.id,
                    "delta": e.delta,
                    "reason": e.reason,
                    "ref_id": e.ref_id,
                    "created_at": e.created_at.isoformat(),
                }
                for e in entries
            ]
            
        except Exception as e:
            logger.error(f"Error getting ledger history: {e}")
            return []

