"""
Quick API Test Script

Run this to verify the backend is working correctly
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n1. Testing Health Endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_packages():
    """Test packages endpoint"""
    print("\n2. Testing Packages Endpoint...")
    response = requests.get(f"{BASE_URL}/api/packages/")
    print(f"Status: {response.status_code}")
    packages = response.json()
    print(f"Found {len(packages)} packages:")
    for pkg in packages:
        print(f"  - {pkg['name']}: ₹{pkg['price']}")
    return response.status_code == 200

def test_register():
    """Test user registration"""
    print("\n3. Testing User Registration...")
    data = {
        "email": "test@example.com",
        "password": "test123",
        "full_name": "Test User",
        "phone": "+919876543210"
    }
    response = requests.post(f"{BASE_URL}/api/auth/register", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"User created with referral code: {result.get('referral_code')}")
        return result.get('access_token')
    else:
        print(f"Error: {response.json()}")
        return None

def test_login():
    """Test user login"""
    print("\n4. Testing User Login...")
    data = {
        "email": "test@example.com",
        "password": "test123"
    }
    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Login successful! Token received.")
        return result.get('access_token')
    else:
        print(f"Error: {response.json()}")
        return None

def test_get_user(token):
    """Test get current user"""
    print("\n5. Testing Get Current User...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        user = response.json()
        print(f"User: {user['full_name']} ({user['email']})")
        print(f"Referral Code: {user['referral_code']}")
        return True
    else:
        print(f"Error: {response.json()}")
        return False

def test_commission_matrix():
    """Test commission calculation"""
    print("\n6. Testing Commission Matrix...")
    from app.services.commission_calculator import calculate_commission, COMMISSION_MATRIX
    
    print("\nCommission Matrix:")
    for referrer_pkg in ["Silver", "Gold", "Platinum"]:
        print(f"\n{referrer_pkg} Referrer:")
        for referee_pkg in ["Silver", "Gold", "Platinum"]:
            level1 = calculate_commission(referrer_pkg, referee_pkg, 1)
            level2 = calculate_commission(referrer_pkg, referee_pkg, 2)
            print(f"  → {referee_pkg}: L1=₹{level1}, L2=₹{level2}")
    
    return True

def main():
    """Run all tests"""
    print("=" * 60)
    print("AFFILIATE LEARNING PLATFORM - API TEST")
    print("=" * 60)
    
    results = []
    
    # Test 1: Health
    results.append(("Health Check", test_health()))
    
    # Test 2: Packages
    results.append(("Packages List", test_packages()))
    
    # Test 3: Register (might fail if user exists)
    token = test_register()
    if not token:
        # Try login instead
        token = test_login()
    results.append(("Authentication", token is not None))
    
    # Test 4: Get User
    if token:
        results.append(("Get User", test_get_user(token)))
    
    # Test 5: Commission Matrix
    results.append(("Commission Matrix", test_commission_matrix()))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    print(f"\nTotal: {passed_count}/{total_count} tests passed")
    print("=" * 60)

if __name__ == "__main__":
    main()

