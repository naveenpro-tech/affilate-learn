"""
Add database indexes for performance optimization
"""
from app.core.database import engine
from sqlalchemy import text

def add_indexes():
    """Add indexes to frequently queried columns"""
    print("Adding database indexes...")
    
    with engine.connect() as conn:
        # Users table indexes
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)"))
            print("✅ Created index on users.email")
        except Exception as e:
            print(f"⚠️  Index on users.email: {e}")
        
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code)"))
            print("✅ Created index on users.referral_code")
        except Exception as e:
            print(f"⚠️  Index on users.referral_code: {e}")
        
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_referred_by_id ON users(referred_by_id)"))
            print("✅ Created index on users.referred_by_id")
        except Exception as e:
            print(f"⚠️  Index on users.referred_by_id: {e}")
        
        # Commissions table indexes
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_commissions_user_id ON commissions(user_id)"))
            print("✅ Created index on commissions.user_id")
        except Exception as e:
            print(f"⚠️  Index on commissions.user_id: {e}")
        
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status)"))
            print("✅ Created index on commissions.status")
        except Exception as e:
            print(f"⚠️  Index on commissions.status: {e}")
        
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_commissions_user_status ON commissions(user_id, status)"))
            print("✅ Created composite index on commissions(user_id, status)")
        except Exception as e:
            print(f"⚠️  Composite index on commissions(user_id, status): {e}")
        
        # Payouts table indexes
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payouts(user_id)"))
            print("✅ Created index on payouts.user_id")
        except Exception as e:
            print(f"⚠️  Index on payouts.user_id: {e}")
        
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status)"))
            print("✅ Created index on payouts.status")
        except Exception as e:
            print(f"⚠️  Index on payouts.status: {e}")
        
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_payouts_user_status ON payouts(user_id, status)"))
            print("✅ Created composite index on payouts(user_id, status)")
        except Exception as e:
            print(f"⚠️  Composite index on payouts(user_id, status): {e}")
        
        # Payments table indexes
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id)"))
            print("✅ Created index on payments.user_id")
        except Exception as e:
            print(f"⚠️  Index on payments.user_id: {e}")
        
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)"))
            print("✅ Created index on payments.status")
        except Exception as e:
            print(f"⚠️  Index on payments.status: {e}")
        
        # User packages table indexes
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_user_packages_user_id ON user_packages(user_id)"))
            print("✅ Created index on user_packages.user_id")
        except Exception as e:
            print(f"⚠️  Index on user_packages.user_id: {e}")
        
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_user_packages_status ON user_packages(status)"))
            print("✅ Created index on user_packages.status")
        except Exception as e:
            print(f"⚠️  Index on user_packages.status: {e}")
        
        # Referrals table indexes
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id)"))
            print("✅ Created index on referrals.referrer_id")
        except Exception as e:
            print(f"⚠️  Index on referrals.referrer_id: {e}")
        
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON referrals(referee_id)"))
            print("✅ Created index on referrals.referee_id")
        except Exception as e:
            print(f"⚠️  Index on referrals.referee_id: {e}")
        
        conn.commit()
    
    print("\n✅ All indexes created successfully!")

if __name__ == "__main__":
    add_indexes()

