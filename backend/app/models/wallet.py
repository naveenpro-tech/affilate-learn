from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum

class TransactionType(str, enum.Enum):
    CREDIT = "credit"  # Money added to wallet
    DEBIT = "debit"    # Money deducted from wallet

class TransactionSource(str, enum.Enum):
    COMMISSION = "commission"  # Commission earned
    PAYOUT = "payout"          # Payout withdrawal
    PURCHASE = "purchase"      # Package purchase
    REFUND = "refund"          # Refund
    ADMIN = "admin"            # Admin adjustment

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    balance = Column(Float, default=0.0, nullable=False)
    total_earned = Column(Float, default=0.0, nullable=False)  # Total money earned (commissions)
    total_withdrawn = Column(Float, default=0.0, nullable=False)  # Total money withdrawn
    total_spent = Column(Float, default=0.0, nullable=False)  # Total money spent on purchases
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet", order_by="WalletTransaction.created_at.desc()")

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False, index=True)
    type = Column(SQLEnum(TransactionType), nullable=False)  # credit or debit
    source = Column(SQLEnum(TransactionSource), nullable=False)  # commission, payout, purchase, etc.
    amount = Column(Float, nullable=False)
    balance_before = Column(Float, nullable=False)
    balance_after = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    reference_id = Column(String(100), nullable=True)  # Reference to commission_id, payout_id, etc.
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationship
    wallet = relationship("Wallet", back_populates="transactions")

