"""
Test script for security features
"""
import requests
import time

BASE_URL = "http://localhost:8000"

def test_rate_limiting():
    """Test rate limiting on login endpoint"""
    print("\n=== Testing Rate Limiting ===")
    
    # Try to login 11 times (limit is 10/minute)
    for i in range(11):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@example.com", "password": "wrongpassword"}
        )
        print(f"Attempt {i+1}: Status {response.status_code}")
        
        if response.status_code == 429:
            print("✅ Rate limiting working! Got 429 Too Many Requests")
            return True
    
    print("❌ Rate limiting not working - should have been blocked")
    return False

def test_update_profile():
    """Test update profile endpoint"""
    print("\n=== Testing Update Profile ===")
    
    # Login first
    login_response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "admin@example.com", "password": "admin123"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return False
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Update profile
    update_response = requests.put(
        f"{BASE_URL}/api/auth/profile",
        json={"full_name": "Admin User Updated", "phone": "9876543210"},
        headers=headers
    )
    
    if update_response.status_code == 200:
        print(f"✅ Profile updated successfully!")
        print(f"   New name: {update_response.json()['full_name']}")
        print(f"   New phone: {update_response.json()['phone']}")
        return True
    else:
        print(f"❌ Profile update failed: {update_response.status_code}")
        print(f"   Response: {update_response.text}")
        return False

def test_change_password():
    """Test change password endpoint"""
    print("\n=== Testing Change Password ===")
    
    # Login first
    login_response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "admin@example.com", "password": "admin123"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return False
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try to change password with wrong current password
    wrong_response = requests.post(
        f"{BASE_URL}/api/auth/change-password",
        params={"current_password": "wrongpassword", "new_password": "newpassword123"},
        headers=headers
    )
    
    if wrong_response.status_code == 400:
        print("✅ Correctly rejected wrong current password")
    else:
        print(f"❌ Should have rejected wrong password: {wrong_response.status_code}")
        return False
    
    # Change password with correct current password
    change_response = requests.post(
        f"{BASE_URL}/api/auth/change-password",
        params={"current_password": "admin123", "new_password": "admin123new"},
        headers=headers
    )
    
    if change_response.status_code == 200:
        print("✅ Password changed successfully!")
        
        # Try to login with new password
        new_login = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@example.com", "password": "admin123new"}
        )
        
        if new_login.status_code == 200:
            print("✅ Can login with new password!")
            
            # Change back to original password
            token2 = new_login.json()["access_token"]
            headers2 = {"Authorization": f"Bearer {token2}"}
            requests.post(
                f"{BASE_URL}/api/auth/change-password",
                params={"current_password": "admin123new", "new_password": "admin123"},
                headers=headers2
            )
            print("✅ Password changed back to original")
            return True
        else:
            print(f"❌ Cannot login with new password: {new_login.status_code}")
            return False
    else:
        print(f"❌ Password change failed: {change_response.status_code}")
        print(f"   Response: {change_response.text}")
        return False

if __name__ == "__main__":
    print("🔒 Testing Security Features")
    print("=" * 50)
    
    # Test rate limiting
    rate_limit_ok = test_rate_limiting()
    
    # Wait a bit to reset rate limit
    print("\nWaiting 5 seconds to reset rate limit...")
    time.sleep(5)
    
    # Test update profile
    profile_ok = test_update_profile()
    
    # Test change password
    password_ok = test_change_password()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"  Rate Limiting: {'✅ PASS' if rate_limit_ok else '❌ FAIL'}")
    print(f"  Update Profile: {'✅ PASS' if profile_ok else '❌ FAIL'}")
    print(f"  Change Password: {'✅ PASS' if password_ok else '❌ FAIL'}")
    print("=" * 50)

