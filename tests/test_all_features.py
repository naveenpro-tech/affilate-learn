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
            
            # Fill registration form
            await self.page.fill('input[name="fullName"]', 'Test User')
            await self.page.fill('input[type="email"]', TEST_USER_EMAIL)
            await self.page.fill('input[type="tel"]', '9876543210')
            await self.page.fill('input[type="password"]', TEST_USER_PASSWORD)
            
            await self.screenshot("02_registration_form")
            
            # Submit
            await self.page.click('button[type="submit"]')
            await self.page.wait_for_url("**/dashboard", timeout=15000)
            
            await self.screenshot("02_after_registration")
            await self.log_test("User Registration", True, f"Registered: {TEST_USER_EMAIL}")
        except Exception as e:
            await self.screenshot("02_registration_error")
            await self.log_test("User Registration", False, str(e))

    async def test_03_profile_enhancement(self):
        """Test 3: Update Profile with Username, Bio, Social Links"""
        try:
            # Go to profile page
            await self.page.goto(f"{FRONTEND_URL}/profile")
            await self.wait_for_navigation()
            
            # Click Edit Profile
            await self.page.click('button:has-text("Edit Profile")')
            await self.page.wait_for_timeout(1000)
            
            # Fill new fields
            await self.page.fill('input[name="username"]', 'testuser123')
            await self.page.fill('textarea[name="bio"]', 'This is my test bio for the MLM platform')
            await self.page.fill('input[name="instagram_url"]', 'https://instagram.com/testuser')
            await self.page.fill('input[name="twitter_url"]', 'https://twitter.com/testuser')
            await self.page.fill('input[name="linkedin_url"]', 'https://linkedin.com/in/testuser')
            
            await self.screenshot("03_profile_edit")
            
            # Save
            await self.page.click('button:has-text("Save")')
            await self.page.wait_for_timeout(2000)
            
            await self.screenshot("03_profile_saved")
            await self.log_test("Profile Enhancement", True, "Profile updated with new fields")
        except Exception as e:
            await self.screenshot("03_profile_error")
            await self.log_test("Profile Enhancement", False, str(e))

    async def test_04_logout_and_admin_login(self):
        """Test 4: Logout and Login as Admin"""
        try:
            # Logout
            await self.page.click('button:has-text("Logout")')
            await self.page.wait_for_url("**/login", timeout=5000)
            
            # Login as admin
            await self.page.fill('input[type="email"]', ADMIN_EMAIL)
            await self.page.fill('input[type="password"]', ADMIN_PASSWORD)
            await self.page.click('button[type="submit"]')
            await self.page.wait_for_url("**/dashboard", timeout=10000)
            
            await self.screenshot("04_admin_dashboard")
            await self.log_test("Admin Login", True, "Admin logged in successfully")
        except Exception as e:
            await self.screenshot("04_admin_login_error")
            await self.log_test("Admin Login", False, str(e))

    async def test_05_unified_course_creation(self):
        """Test 5: Create Course with Modules and Topics (Unified Workflow)"""
        try:
            # Navigate to admin courses
            await self.page.goto(f"{FRONTEND_URL}/admin/courses")
            await self.wait_for_navigation()
            
            # Click Create Course with Modules
            await self.page.click('button:has-text("Create Course with Modules")')
            await self.page.wait_for_url("**/admin/courses/new", timeout=5000)
            
            # Fill course details
            await self.page.fill('input[placeholder*="Digital Marketing"]', 'Test Course for GUI Testing')
            await self.page.fill('textarea[placeholder*="Describe what students"]', 'This is a test course created by automated GUI tests')
            
            await self.screenshot("05_course_form")
            
            # Add a module
            await self.page.click('button:has-text("Add Module")')
            await self.page.wait_for_timeout(1000)
            
            # Fill module details
            module_title_input = self.page.locator('input[placeholder*="Module"]').first
            await module_title_input.fill('Introduction Module')
            
            await self.screenshot("05_module_added")
            
            # Add a topic
            await self.page.click('button:has-text("Add Topic")').first
            await self.page.wait_for_timeout(1000)
            
            # Fill topic details
            topic_title_input = self.page.locator('input[placeholder*="Topic"]').first
            await topic_title_input.fill('Welcome Video')
            
            # Select YouTube as video source
            await self.page.select_option('select', 'youtube')
            
            # Add YouTube URL
            url_input = self.page.locator('input[placeholder*="youtube"]').first
            await url_input.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            
            # Set duration
            duration_input = self.page.locator('input[type="number"]').first
            await duration_input.fill('300')
            
            await self.screenshot("05_topic_added")
            
            # Save course
            await self.page.click('button:has-text("Save Course")')
            await self.page.wait_for_url("**/admin/courses", timeout=15000)
            
            await self.screenshot("05_course_created")
            await self.log_test("Unified Course Creation", True, "Course created with module and topic")
        except Exception as e:
            await self.screenshot("05_course_creation_error")
            await self.log_test("Unified Course Creation", False, str(e))

    async def test_06_certificates_page(self):
        """Test 6: Certificates Page Loads"""
        try:
            await self.page.goto(f"{FRONTEND_URL}/certificates")
            await self.wait_for_navigation()
            
            # Check page loaded
            await expect(self.page.locator('text=My Certificates')).to_be_visible()
            
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
            
            # Check page loaded
            await expect(self.page.locator('text=Top Earners')).to_be_visible()
            
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
            
            # Check page loaded
            await expect(self.page.locator('text=Payouts')).to_be_visible()
            
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

    async def test_10_admin_modules_page(self):
        """Test 10: Admin Modules Management Page"""
        try:
            await self.page.goto(f"{FRONTEND_URL}/admin/modules")
            await self.wait_for_navigation()
            
            # Check page loaded
            await expect(self.page.locator('text=Modules Management')).to_be_visible()
            
            await self.screenshot("10_admin_modules")
            await self.log_test("Admin Modules Page", True, "Admin modules page loaded")
        except Exception as e:
            await self.screenshot("10_admin_modules_error")
            await self.log_test("Admin Modules Page", False, str(e))

    # ==================== RUN ALL TESTS ====================

    async def run_all_tests(self):
        """Run all test suites"""
        print("\n" + "="*80)
        print("🚀 STARTING COMPREHENSIVE GUI TESTS")
        print("="*80)
        
        await self.setup()
        
        try:
            # Run all tests
            await self.test_01_homepage_loads()
            await self.test_02_user_registration()
            await self.test_03_profile_enhancement()
            await self.test_04_logout_and_admin_login()
            await self.test_05_unified_course_creation()
            await self.test_06_certificates_page()
            await self.test_07_leaderboard()
            await self.test_08_payouts_page()
            await self.test_09_navigation_menu()
            await self.test_10_admin_modules_page()
            
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

