from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class WalletBase(BaseModel):
    balance: float
    total_earned: float
    total_withdrawn: float
    total_spent: float

class WalletResponse(WalletBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WalletTransactionBase(BaseModel):
    type: str  # credit or debit
    source: str  # commission, payout, purchase, refund, admin
    amount: float
    description: str
    reference_id: Optional[str] = None

class WalletTransactionCreate(WalletTransactionBase):
    wallet_id: int
    balance_before: float
    balance_after: float

class WalletTransactionResponse(WalletTransactionBase):
    id: int
    wallet_id: int
    balance_before: float
    balance_after: float
    created_at: datetime

    class Config:
        from_attributes = True

class WalletWithTransactions(WalletResponse):
    transactions: List[WalletTransactionResponse] = []

class WalletStats(BaseModel):
    balance: float
    total_earned: float
    total_withdrawn: float
    total_spent: float
    available_for_withdrawal: float
    recent_transactions_count: int

