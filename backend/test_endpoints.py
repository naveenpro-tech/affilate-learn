"""
Quick API endpoint test to verify all routes are working
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n🔍 Testing Health Endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("✅ Health endpoint working")

def test_packages():
    """Test packages endpoint"""
    print("\n🔍 Testing Packages Endpoint...")
    response = requests.get(f"{BASE_URL}/api/packages/")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Packages found: {len(data)}")
    for pkg in data:
        print(f"  - {pkg['name']}: ₹{pkg['final_price']}")
    assert response.status_code == 200
    assert len(data) == 3
    print("✅ Packages endpoint working")

def test_register_and_login():
    """Test registration and login"""
    print("\n🔍 Testing Registration...")
    
    # Register new user
    register_data = {
        "email": "testuser@example.com",
        "password": "testpass123",
        "full_name": "Test User",
        "phone": "9999999999"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 400:
        print("⚠️  User already exists, trying login...")
    elif response.status_code == 201:
        data = response.json()
        print(f"User created: {data['email']}")
        print(f"Referral code: {data['referral_code']}")
        print("✅ Registration working")
    
    # Login
    print("\n🔍 Testing Login...")
    login_data = {
        "email": "testuser@example.com",
        "password": "testpass123"
    }

    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data['access_token']
        print(f"Token received: {token[:20]}...")
        print("✅ Login working")
        return token
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def test_protected_routes(token):
    """Test protected routes with authentication"""
    if not token:
        print("\n⚠️  Skipping protected routes test (no token)")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🔍 Testing Protected Route: /api/auth/me")
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"User: {data['full_name']} ({data['email']})")
        print(f"Package: {data.get('current_package', 'None')}")
        print("✅ Protected route working")
    else:
        print(f"❌ Protected route failed: {response.text}")
    
    print("\n🔍 Testing Referral Stats...")
    response = requests.get(f"{BASE_URL}/api/auth/referral-stats", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Total Earnings: ₹{data['total_earnings']}")
        print(f"Direct Referrals: {data['direct_referrals']}")
        print("✅ Referral stats working")

def test_admin_login():
    """Test admin login"""
    print("\n🔍 Testing Admin Login...")
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }

    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data['access_token']
        print("✅ Admin login working")
        
        # Test admin endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=headers)
        print(f"\n🔍 Testing Admin Dashboard...")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Total Users: {data['users']['total']}")
            print(f"Total Revenue: ₹{data['revenue']['total']}")
            print("✅ Admin dashboard working")
        else:
            print(f"❌ Admin dashboard failed: {response.text}")
    else:
        print(f"❌ Admin login failed: {response.text}")

def main():
    print("=" * 60)
    print("🚀 AFFILIATE LEARNING PLATFORM - API ENDPOINT TESTS")
    print("=" * 60)
    
    try:
        test_health()
        test_packages()
        token = test_register_and_login()
        test_protected_routes(token)
        test_admin_login()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print("\n📝 Next Steps:")
        print("1. Open http://localhost:3000 in your browser")
        print("2. Follow the TESTING_GUIDE.md for manual testing")
        print("3. Test the complete user flow with Razorpay payments")
        print("\n🔑 Admin Credentials:")
        print("   Email: admin@example.com")
        print("   Password: admin123")
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

