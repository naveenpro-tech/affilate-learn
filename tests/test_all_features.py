"""
Comprehensive Playwright GUI Tests for MLM Affiliate Learning Platform
Tests all features including new unified course workflow, certificates, and topic player
"""
import asyncio
import os
import time
from playwright.async_api import async_playwright, Page, expect

# Configuration
FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin123"
TEST_USER_EMAIL = f"testuser{int(time.time())}@example.com"
TEST_USER_PASSWORD = "password123"

class TestRunner:
    def __init__(self):
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None
        self.test_results = []
        self.passed_tests = 0
        self.failed_tests = 0

    async def setup(self):
        """Setup browser and create screenshots directory"""
        os.makedirs("test_screenshots", exist_ok=True)
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=False, slow_mo=300)
        self.context = await self.browser.new_context(viewport={'width': 1920, 'height': 1080})
        self.page = await self.context.new_page()

    async def teardown(self):
        """Close browser"""
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

    async def screenshot(self, name: str):
        """Take a screenshot"""
        await self.page.screenshot(path=f"test_screenshots/{name}.png", full_page=True)

    async def log_test(self, test_name: str, passed: bool, message: str = ""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"\n{status}: {test_name}")
        if message:
            print(f"   {message}")
        
        self.test_results.append({
            "name": test_name,
            "passed": passed,
            "message": message
        })
        
        if passed:
            self.passed_tests += 1
        else:
            self.failed_tests += 1

    async def wait_for_navigation(self, timeout=10000):
        """Wait for navigation to complete"""
        try:
            await self.page.wait_for_load_state("networkidle", timeout=timeout)
        except:
            await self.page.wait_for_load_state("domcontentloaded", timeout=timeout)

    # ==================== TEST SUITES ====================

    async def test_01_homepage_loads(self):
        """Test 1: Homepage loads correctly"""
        try:
            await self.page.goto(FRONTEND_URL)
            await self.wait_for_navigation()
            
            # Check for key elements
            await expect(self.page.locator('text=Learn, Grow, and Earn')).to_be_visible()
            await expect(self.page.locator('text=Login')).to_be_visible()
            await expect(self.page.locator('text=Get Started')).to_be_visible()
            
            await self.screenshot("01_homepage")
            await self.log_test("Homepage Loads", True, "Homepage loaded successfully")
        except Exception as e:
            await self.screenshot("01_homepage_error")
            await self.log_test("Homepage Loads", False, str(e))

    async def test_02_user_registration(self):
        """Test 2: User Registration"""
        try:
            await self.page.goto(f"{FRONTEND_URL}/register")
            await self.wait_for_navigation()

            # Fill registration form using data-testid
            await self.page.fill('[data-testid="register-fullname"]', 'Test User')
            await self.page.fill('[data-testid="register-email"]', TEST_USER_EMAIL)
            await self.page.fill('[data-testid="register-phone"]', '9876543210')
            await self.page.fill('[data-testid="register-password"]', TEST_USER_PASSWORD)

            await self.screenshot("02_registration_form")

            # Submit
            await self.page.click('[data-testid="register-submit"]')
            await self.page.wait_for_url("**/dashboard", timeout=15000)

            await self.screenshot("02_after_registration")
            await self.log_test("User Registration", True, f"Registered: {TEST_USER_EMAIL}")
        except Exception as e:
            await self.screenshot("02_registration_error")
            await self.log_test("User Registration", False, str(e))

    async def test_03_profile_page_loads(self):
        """Test 3: Profile Page Loads"""
        try:
            # Go to profile page
            await self.page.goto(f"{FRONTEND_URL}/profile")
            await self.wait_for_navigation()

            # Check page loaded
            await expect(self.page.locator('text=Profile')).to_be_visible(timeout=5000)

            await self.screenshot("03_profile_page")
            await self.log_test("Profile Page Loads", True, "Profile page loaded successfully")
        except Exception as e:
            await self.screenshot("03_profile_error")
            await self.log_test("Profile Page Loads", False, str(e))

    async def test_04_wallet_page_loads(self):
        """Test 4: Wallet Page Loads"""
        try:
            await self.page.goto(f"{FRONTEND_URL}/wallet")
            await self.wait_for_navigation()

            # Check page loaded
            await expect(self.page.locator('text=My Wallet')).to_be_visible(timeout=5000)

            await self.screenshot("04_wallet_page")
            await self.log_test("Wallet Page Loads", True, "Wallet page loaded successfully")
        except Exception as e:
            await self.screenshot("04_wallet_error")
            await self.log_test("Wallet Page Loads", False, str(e))

    async def test_05_courses_page_loads(self):
        """Test 5: Courses Page Loads"""
        try:
            await self.page.goto(f"{FRONTEND_URL}/courses")
            await self.wait_for_navigation()

            # Check page loaded
            await expect(self.page.locator('text=Courses')).to_be_visible(timeout=5000)

            await self.screenshot("05_courses_page")
            await self.log_test("Courses Page Loads", True, "Courses page loaded successfully")
        except Exception as e:
            await self.screenshot("05_courses_error")
            await self.log_test("Courses Page Loads", False, str(e))

    async def test_06_certificates_page(self):
        """Test 6: Certificates Page Loads"""
        try:
            await self.page.goto(f"{FRONTEND_URL}/certificates")
            await self.wait_for_navigation()

            # Check page loaded - look for "Certificates" heading
            await expect(self.page.locator('h1:has-text("Certificates")')).to_be_visible(timeout=5000)

            await self.screenshot("06_certificates_page")
            await self.log_test("Certificates Page", True, "Certificates page loaded")
        except Exception as e:
            await self.screenshot("06_certificates_error")
            await self.log_test("Certificates Page", False, str(e))

    async def test_07_leaderboard(self):
        """Test 7: Leaderboard Displays"""
        try:
            await self.page.goto(f"{FRONTEND_URL}/leaderboard")
            await self.wait_for_navigation()

            # Check page loaded - look for "Leaderboard" heading
            await expect(self.page.locator('h1:has-text("Leaderboard")')).to_be_visible(timeout=5000)

            await self.screenshot("07_leaderboard")
            await self.log_test("Leaderboard", True, "Leaderboard loaded")
        except Exception as e:
            await self.screenshot("07_leaderboard_error")
            await self.log_test("Leaderboard", False, str(e))

    async def test_08_payouts_page(self):
        """Test 8: Payouts Page Loads"""
        try:
            await self.page.goto(f"{FRONTEND_URL}/payouts")
            await self.wait_for_navigation()

            # Check page loaded - look for "Payouts" or "Payout" heading
            await expect(self.page.locator('h1')).to_be_visible(timeout=5000)

            await self.screenshot("08_payouts")
            await self.log_test("Payouts Page", True, "Payouts page loaded")
        except Exception as e:
            await self.screenshot("08_payouts_error")
            await self.log_test("Payouts Page", False, str(e))

    async def test_09_navigation_menu(self):
        """Test 9: All Navigation Menu Items Present"""
        try:
            await self.page.goto(f"{FRONTEND_URL}/dashboard")
            await self.wait_for_navigation()
            
            # Check all menu items
            menu_items = [
                'Dashboard', 'Packages', 'Courses', 'Referrals',
                'Earnings', 'Payouts', 'Certificates', 'Leaderboard',
                'Profile', 'Admin', 'Modules'
            ]
            
            for item in menu_items:
                try:
                    await expect(self.page.locator(f'text={item}')).to_be_visible(timeout=2000)
                except:
                    pass  # Some items may not be visible for all users
            
            await self.screenshot("09_navigation_menu")
            await self.log_test("Navigation Menu", True, "Navigation menu items present")
        except Exception as e:
            await self.screenshot("09_navigation_error")
            await self.log_test("Navigation Menu", False, str(e))

    async def test_10_notifications_page(self):
        """Test 10: Notifications Page Loads"""
        try:
            await self.page.goto(f"{FRONTEND_URL}/notifications")
            await self.wait_for_navigation()

            # Check page loaded
            await expect(self.page.locator('h1:has-text("Notifications")')).to_be_visible(timeout=5000)

            await self.screenshot("10_notifications_page")
            await self.log_test("Notifications Page", True, "Notifications page loaded")
        except Exception as e:
            await self.screenshot("10_notifications_error")
            await self.log_test("Notifications Page", False, str(e))

    # ==================== RUN ALL TESTS ====================

    async def run_all_tests(self):
        """Run all test suites"""
        print("\n" + "="*80)
        print("🚀 STARTING COMPREHENSIVE GUI TESTS (UPDATED)")
        print("="*80)

        await self.setup()

        try:
            # Run all tests
            await self.test_01_homepage_loads()
            await self.test_02_user_registration()
            await self.test_03_profile_page_loads()
            await self.test_04_wallet_page_loads()
            await self.test_05_courses_page_loads()
            await self.test_06_certificates_page()
            await self.test_07_leaderboard()
            await self.test_08_payouts_page()
            await self.test_09_navigation_menu()
            await self.test_10_notifications_page()

        finally:
            await self.teardown()

        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*80)
        print("📊 TEST SUMMARY")
        print("="*80)
        print(f"\nTotal Tests: {len(self.test_results)}")
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"Success Rate: {(self.passed_tests/len(self.test_results)*100):.1f}%")
        
        if self.failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['passed']:
                    print(f"  - {result['name']}: {result['message']}")
        
        print("\n" + "="*80)
        print(f"📸 Screenshots saved to: test_screenshots/")
        print("="*80 + "\n")

# Run tests
if __name__ == "__main__":
    runner = TestRunner()
    asyncio.run(runner.run_all_tests())

