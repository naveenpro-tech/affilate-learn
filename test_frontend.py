"""
Test frontend pages to verify they're loading correctly
"""
import requests
from bs4 import BeautifulSoup

BASE_URL = "http://localhost:3000"

def test_page(url, page_name):
    """Test if a page loads successfully"""
    try:
        response = requests.get(url, timeout=10)
        print(f"\n🔍 Testing {page_name}...")
        print(f"   URL: {url}")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            # Check if HTML contains expected content
            soup = BeautifulSoup(response.text, 'html.parser')
            title = soup.find('title')
            if title:
                print(f"   Title: {title.string}")
            
            # Check for common error indicators
            if 'error' in response.text.lower() or 'cannot read properties' in response.text.lower():
                print(f"   ⚠️  Warning: Page may contain errors")
                return False
            
            print(f"   ✅ {page_name} loaded successfully")
            return True
        else:
            print(f"   ❌ {page_name} failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing {page_name}: {e}")
        return False

def main():
    print("=" * 60)
    print("🚀 FRONTEND PAGE TESTS")
    print("=" * 60)
    
    pages = [
        (f"{BASE_URL}/", "Landing Page"),
        (f"{BASE_URL}/login", "Login Page"),
        (f"{BASE_URL}/register", "Register Page"),
        (f"{BASE_URL}/packages", "Packages Page"),
        (f"{BASE_URL}/dashboard", "Dashboard (should redirect to login)"),
    ]
    
    results = []
    for url, name in pages:
        result = test_page(url, name)
        results.append((name, result))
    
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All frontend pages are loading correctly!")
    else:
        print(f"\n⚠️  {total - passed} page(s) failed to load")

if __name__ == "__main__":
    main()

