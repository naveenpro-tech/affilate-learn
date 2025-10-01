"""
Debug script to investigate referral fetching issues for specific accounts
"""
from app.core.database import SessionLocal
from app.models.user import User
from app.models.referral import Referral
from app.models.user_package import UserPackage
from app.models.package import Package
from app.models.commission import Commission

def debug_user_referrals(email: str):
    """Debug referral data for a specific user"""
    db = SessionLocal()
    
    try:
        # Find the user
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ User not found: {email}")
            return
        
        print(f"\n{'='*80}")
        print(f"🔍 DEBUGGING REFERRALS FOR: {user.full_name} ({user.email})")
        print(f"{'='*80}\n")
        
        print(f"📋 User Details:")
        print(f"  - ID: {user.id}")
        print(f"  - Email: {user.email}")
        print(f"  - Full Name: {user.full_name}")
        print(f"  - Referral Code: {user.referral_code}")
        print(f"  - Referred By ID: {user.referred_by_id}")
        print(f"  - Is Admin: {user.is_admin}")
        print(f"  - Created At: {user.created_at}")
        
        # Check if user has a package
        user_package = db.query(UserPackage).filter(
            UserPackage.user_id == user.id,
            UserPackage.status == "active"
        ).first()
        
        if user_package:
            package = db.query(Package).filter(Package.id == user_package.package_id).first()
            print(f"\n📦 Current Package:")
            print(f"  - Package: {package.name if package else 'Unknown'}")
            print(f"  - Purchase Date: {user_package.purchase_date}")
        else:
            print(f"\n📦 Current Package: None")
        
        # Get all users referred by this user
        referred_users = db.query(User).filter(
            User.referred_by_id == user.id
        ).order_by(User.created_at.desc()).all()
        
        print(f"\n👥 Direct Referrals (Level 1): {len(referred_users)}")
        
        if referred_users:
            print(f"\n{'='*80}")
            print(f"REFERRAL DETAILS:")
            print(f"{'='*80}\n")
            
            for idx, referee in enumerate(referred_users, 1):
                print(f"\n{idx}. {referee.full_name} ({referee.email})")
                print(f"   - User ID: {referee.id}")
                print(f"   - Created: {referee.created_at}")
                
                # Check if they have a package
                ref_package = db.query(UserPackage).filter(
                    UserPackage.user_id == referee.id,
                    UserPackage.status == "active"
                ).first()
                
                if ref_package:
                    package = db.query(Package).filter(Package.id == ref_package.package_id).first()
                    print(f"   - Package: {package.name if package else 'Unknown'}")
                    print(f"   - Purchase Date: {ref_package.purchase_date}")
                else:
                    print(f"   - Package: None (Not purchased yet)")
                
                # Check if referral record exists
                referral = db.query(Referral).filter(
                    Referral.referrer_id == user.id,
                    Referral.referee_id == referee.id
                ).first()
                
                if referral:
                    print(f"   - Referral Record: ✅ Exists (ID: {referral.id}, Level: {referral.level})")
                    
                    # Check for commission
                    commission = db.query(Commission).filter(
                        Commission.referral_id == referral.id
                    ).first()
                    
                    if commission:
                        print(f"   - Commission: ₹{commission.amount} ({commission.status})")
                    else:
                        print(f"   - Commission: ❌ Not created")
                else:
                    print(f"   - Referral Record: ❌ Not created (will be created after purchase)")
        else:
            print(f"\n  No direct referrals found.")
        
        # Check for indirect referrals (Level 2)
        level2_count = 0
        for direct_ref in referred_users:
            indirect_refs = db.query(User).filter(
                User.referred_by_id == direct_ref.id
            ).count()
            level2_count += indirect_refs
        
        print(f"\n👥 Indirect Referrals (Level 2): {level2_count}")
        
        # Test the API endpoint logic
        print(f"\n{'='*80}")
        print(f"🧪 TESTING API ENDPOINT LOGIC:")
        print(f"{'='*80}\n")
        
        result = []
        for referee in referred_users:
            try:
                # Check if they have purchased a package
                user_package = db.query(UserPackage).filter(
                    UserPackage.user_id == referee.id,
                    UserPackage.status == "active"
                ).order_by(UserPackage.purchase_date.desc()).first()

                # Get package details if they have one
                package = None
                if user_package:
                    package = db.query(Package).filter(Package.id == user_package.package_id).first()

                # Get referral record if exists (created after purchase)
                referral = db.query(Referral).filter(
                    Referral.referrer_id == user.id,
                    Referral.referee_id == referee.id
                ).first()

                # Get commission amount if referral exists
                commission_amount = None
                if referral:
                    commission = db.query(Commission).filter(
                        Commission.referral_id == referral.id
                    ).first()
                    commission_amount = commission.amount if commission else None

                referral_data = {
                    "id": referral.id if referral else referee.id,
                    "referrer_id": user.id,
                    "referee_id": referee.id,
                    "level": referral.level if referral else 1,
                    "package_id": user_package.package_id if user_package else None,
                    "created_at": str(referral.created_at if referral else referee.created_at),
                    "referee_email": referee.email,
                    "referee_name": referee.full_name,
                    "package_name": package.name if package else "No Package",
                    "commission_amount": commission_amount
                }

                result.append(referral_data)
                print(f"✅ Successfully processed: {referee.email}")
                
            except Exception as e:
                print(f"❌ Error processing {referee.email}: {str(e)}")
                import traceback
                traceback.print_exc()
        
        print(f"\n📊 API Response would contain {len(result)} referrals")
        
        if result:
            print(f"\n{'='*80}")
            print(f"SAMPLE API RESPONSE:")
            print(f"{'='*80}\n")
            import json
            print(json.dumps(result[0], indent=2, default=str))
        
        print(f"\n{'='*80}")
        print(f"✅ DEBUG COMPLETE")
        print(f"{'='*80}\n")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    print("\n" + "="*80)
    print("REFERRAL DEBUG TOOL")
    print("="*80 + "\n")
    
    # Debug both accounts
    print("\n🔍 Testing Admin Account:")
    debug_user_referrals("admin@example.com")
    
    print("\n\n🔍 Testing Naveen Vidar Account:")
    debug_user_referrals("naveenvide@gmail.com")
    
    # Also try variations
    print("\n\n🔍 Checking for similar email variations:")
    db = SessionLocal()
    users = db.query(User).filter(User.email.like('%naveen%')).all()
    if users:
        print(f"\nFound {len(users)} users with 'naveen' in email:")
        for user in users:
            print(f"  - {user.email} ({user.full_name})")
            debug_user_referrals(user.email)
    else:
        print("\nNo users found with 'naveen' in email")
    db.close()

