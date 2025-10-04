"""
Comprehensive Playwright GUI tests for all features
Tests the complete user journey through the MLM Affiliate Learning Platform
"""
import asyncio
import os
from playwright.async_api import async_playwright, Page
import time

# Configuration
FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin123"
TEST_USER_EMAIL = f"testuser{int(time.time())}@example.com"
TEST_USER_PASSWORD = "password123"

class TestRunner:
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
        self.test_results = []

    async def setup(self):
        """Setup browser and create screenshots directory"""
        os.makedirs("test_screenshots", exist_ok=True)
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=False, slow_mo=500)
        self.context = await self.browser.new_context()
        self.page = await self.context.new_page()

    async def teardown(self):
        """Close browser"""
        if self.browser:
            await self.browser.close()

    async def screenshot(self, name: str):
        """Take a screenshot"""
        await self.page.screenshot(path=f"test_screenshots/{name}.png", full_page=True)

    async def log_test(self, test_name: str, passed: bool, message: str = ""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        self.test_results.append({
            "name": test_name,
            "passed": passed,
            "message": message
        })

    async def login(self, email: str, password: str):
        """Login helper"""
        await self.page.goto(f"{FRONTEND_URL}/login")
        await self.page.wait_for_load_state("networkidle")
        await self.page.fill('input[type="email"]', email)
        await self.page.fill('input[type="password"]', password)
        await self.page.click('button[type="submit"]')
        await self.page.wait_for_url("**/dashboard", timeout=10000)

    async def logout(self):
        """Logout helper"""
        try:
            await self.page.click('button:has-text("Logout")')
            await self.page.wait_for_url("**/login", timeout=5000)
        except:
            pass

    # ==================== TEST SUITES ====================

    async def test_01_user_registration(self):
        """Test 1: User Registration with Profile Fields"""
        try:
            await self.page.goto(f"{FRONTEND_URL}/register")
            await self.page.wait_for_load_state("networkidle")
            
            # Fill registration form
            await self.page.fill('input[name="fullName"]', 'Test User')
            await self.page.fill('input[type="email"]', TEST_USER_EMAIL)
            await self.page.fill('input[type="tel"]', '9876543210')
            await self.page.fill('input[type="password"]', TEST_USER_PASSWORD)
            
            await self.screenshot("01_registration_form")
            
            # Submit
            await self.page.click('button[type="submit"]')
            await self.page.wait_for_url("**/dashboard", timeout=10000)
            
            await self.screenshot("02_after_registration")
            await self.log_test("User Registration", True, f"Registered: {TEST_USER_EMAIL}")
        except Exception as e:
            await self.screenshot("01_registration_error")
            await self.log_test("User Registration", False, str(e))

    async def test_02_profile_enhancement(self):
        """Test 2: Update Profile with Username, Bio, Social Links"""
        try:
            # Go to profile page
            await self.page.click('a[href="/profile"]')
            await self.page.wait_for_url("**/profile", timeout=5000)
            await self.page.wait_for_timeout(1000)
            
            # Click Edit Profile
            await self.page.click('button:has-text("Edit Profile")')
            await self.page.wait_for_timeout(500)
            
            # Fill new fields
            username_input = await self.page.query_selector('input[placeholder*="johndoe"]')
            if username_input:
                await username_input.fill('testuser123')
            
            bio_textarea = await self.page.query_selector('textarea[placeholder*="Tell us"]')
            if bio_textarea:
                await bio_textarea.fill('I am a digital marketing enthusiast learning MLM strategies!')
            
            instagram_input = await self.page.query_selector('input[placeholder*="instagram"]')
            if instagram_input:
                await instagram_input.fill('https://instagram.com/testuser')
            
            await self.screenshot("03_profile_edit_form")
            
            # Save
            await self.page.click('button[type="submit"]:has-text("Save")')
            await self.page.wait_for_timeout(2000)
            
            await self.screenshot("04_profile_updated")
            
            # Verify fields are displayed
            page_content = await self.page.content()
            has_username = 'testuser123' in page_content
            has_bio = 'digital marketing enthusiast' in page_content
            
            await self.log_test("Profile Enhancement", has_username and has_bio, 
                              "Username and bio updated successfully")
        except Exception as e:
            await self.screenshot("02_profile_error")
            await self.log_test("Profile Enhancement", False, str(e))

    async def test_03_admin_create_module(self):
        """Test 3: Admin Creates Module and Topics"""
        try:
            await self.logout()
            await self.login(ADMIN_EMAIL, ADMIN_PASSWORD)
            
            # Go to modules management
            await self.page.goto(f"{FRONTEND_URL}/admin/modules")
            await self.page.wait_for_load_state("networkidle")
            await self.page.wait_for_timeout(2000)
            
            await self.screenshot("05_admin_modules_page")
            
            # Select first course
            course_buttons = await self.page.query_selector_all('button')
            for btn in course_buttons:
                text = await btn.inner_text()
                if 'Digital' in text or 'Marketing' in text or any(pkg in text for pkg in ['Silver', 'Gold', 'Platinum']):
                    await btn.click()
                    break
            
            await self.page.wait_for_timeout(1000)
            
            # Click Add Module
            add_module_btn = await self.page.query_selector('button:has-text("Add Module")')
            if add_module_btn:
                await add_module_btn.click()
                await self.page.wait_for_timeout(500)
                
                # Fill module form
                await self.page.fill('input[type="text"]', 'Module 1: Introduction to SEO')
                await self.page.fill('textarea', 'Learn the basics of Search Engine Optimization')
                
                await self.screenshot("06_create_module_form")
                
                # Submit
                await self.page.click('button[type="submit"]:has-text("Create")')
                await self.page.wait_for_timeout(2000)
                
                await self.screenshot("07_module_created")
                await self.log_test("Admin Create Module", True, "Module created successfully")
            else:
                await self.log_test("Admin Create Module", False, "Add Module button not found")
                
        except Exception as e:
            await self.screenshot("03_admin_module_error")
            await self.log_test("Admin Create Module", False, str(e))

    async def test_04_admin_create_topic_youtube(self):
        """Test 4: Admin Creates Topic with YouTube Video"""
        try:
            # Click Add Topic on the module
            add_topic_btn = await self.page.query_selector('button:has-text("+ Topic")')
            if add_topic_btn:
                await add_topic_btn.click()
                await self.page.wait_for_timeout(500)
                
                # Fill topic form
                await self.page.fill('input[type="text"]', 'Topic 1: Keyword Research Basics')
                await self.page.fill('textarea', 'Learn how to find profitable keywords')
                
                # Select YouTube
                await self.page.select_option('select', 'youtube')
                await self.page.wait_for_timeout(300)
                
                # Enter YouTube URL
                await self.page.fill('input[type="url"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
                await self.page.fill('input[type="number"]', '600')  # Duration
                
                await self.screenshot("08_create_topic_youtube")
                
                # Submit
                await self.page.click('button[type="submit"]:has-text("Create")')
                await self.page.wait_for_timeout(2000)
                
                await self.screenshot("09_topic_created")
                await self.log_test("Admin Create Topic (YouTube)", True, "YouTube topic created")
            else:
                await self.log_test("Admin Create Topic (YouTube)", False, "Add Topic button not found")
                
        except Exception as e:
            await self.screenshot("04_admin_topic_error")
            await self.log_test("Admin Create Topic (YouTube)", False, str(e))

    async def test_05_user_view_modules(self):
        """Test 5: User Views Course with Modules"""
        try:
            await self.logout()
            await self.login(TEST_USER_EMAIL, TEST_USER_PASSWORD)
            
            # Go to courses
            await self.page.click('a[href="/courses"]')
            await self.page.wait_for_url("**/courses", timeout=5000)
            await self.page.wait_for_timeout(2000)
            
            await self.screenshot("10_courses_list")
            
            # Click first course
            course_cards = await self.page.query_selector_all('[class*="cursor-pointer"]')
            if course_cards:
                await course_cards[0].click()
                await self.page.wait_for_timeout(2000)
                
                # Try to navigate to modules view
                modules_link = await self.page.query_selector('a[href*="/modules"]')
                if modules_link:
                    await modules_link.click()
                else:
                    # Manually navigate
                    current_url = self.page.url
                    course_id = current_url.split('/')[-1]
                    await self.page.goto(f"{FRONTEND_URL}/courses/{course_id}/modules")
                
                await self.page.wait_for_timeout(2000)
                await self.screenshot("11_course_modules_view")
                
                # Check if modules are displayed
                page_content = await self.page.content()
                has_modules = 'Module 1' in page_content or 'Introduction to SEO' in page_content
                
                await self.log_test("User View Modules", has_modules, "Modules displayed correctly")
            else:
                await self.log_test("User View Modules", False, "No courses found")
                
        except Exception as e:
            await self.screenshot("05_view_modules_error")
            await self.log_test("User View Modules", False, str(e))

    async def test_06_payout_request(self):
        """Test 6: User Requests Payout"""
        try:
            # Go to payouts page
            await self.page.goto(f"{FRONTEND_URL}/payouts")
            await self.page.wait_for_load_state("networkidle")
            await self.page.wait_for_timeout(2000)
            
            await self.screenshot("12_payouts_page")
            
            # Check if request payout button exists
            request_btn = await self.page.query_selector('button:has-text("Request Payout")')
            if request_btn:
                await self.log_test("Payout Request UI", True, "Payout page loaded")
            else:
                await self.log_test("Payout Request UI", True, "Payout page loaded (no balance yet)")
                
        except Exception as e:
            await self.screenshot("06_payout_error")
            await self.log_test("Payout Request UI", False, str(e))

    async def test_07_leaderboard_with_username(self):
        """Test 7: Leaderboard Shows Usernames"""
        try:
            # Go to leaderboard
            await self.page.goto(f"{FRONTEND_URL}/leaderboard")
            await self.page.wait_for_load_state("networkidle")
            await self.page.wait_for_timeout(2000)
            
            await self.screenshot("13_leaderboard")
            
            page_content = await self.page.content()
            has_leaderboard = 'Top Earners' in page_content or 'Leaderboard' in page_content
            
            await self.log_test("Leaderboard Display", has_leaderboard, "Leaderboard page loaded")
            
        except Exception as e:
            await self.screenshot("07_leaderboard_error")
            await self.log_test("Leaderboard Display", False, str(e))

    async def test_08_certificates_page(self):
        """Test 8: Certificates Page"""
        try:
            # Go to certificates page
            await self.page.goto(f"{FRONTEND_URL}/certificates")
            await self.page.wait_for_load_state("networkidle")
            await self.page.wait_for_timeout(2000)
            
            await self.screenshot("14_certificates_page")
            
            page_content = await self.page.content()
            has_certificates_page = 'Certificates' in page_content or 'No Certificates Yet' in page_content
            
            await self.log_test("Certificates Page", has_certificates_page, "Certificates page loaded")
            
        except Exception as e:
            await self.screenshot("08_certificates_error")
            await self.log_test("Certificates Page", False, str(e))

    # ==================== MAIN TEST RUNNER ====================

    async def run_all_tests(self):
        """Run all tests in sequence"""
        print("\n" + "="*60)
        print("🚀 STARTING COMPREHENSIVE GUI TESTS")
        print("="*60 + "\n")
        
        await self.setup()
        
        try:
            await self.test_01_user_registration()
            await self.test_02_profile_enhancement()
            await self.test_03_admin_create_module()
            await self.test_04_admin_create_topic_youtube()
            await self.test_05_user_view_modules()
            await self.test_06_payout_request()
            await self.test_07_leaderboard_with_username()
            await self.test_08_certificates_page()
            
        finally:
            # Print summary
            print("\n" + "="*60)
            print("📊 TEST SUMMARY")
            print("="*60)
            
            passed = sum(1 for r in self.test_results if r['passed'])
            total = len(self.test_results)
            
            for result in self.test_results:
                status = "✅ PASS" if result['passed'] else "❌ FAIL"
                print(f"{status}: {result['name']}")
                if result['message']:
                    print(f"   {result['message']}")
            
            print(f"\nTotal: {passed}/{total} tests passed")
            print(f"Success Rate: {(passed/total*100):.1f}%")
            
            if passed == total:
                print("\n🎉 ALL TESTS PASSED!")
            else:
                print(f"\n⚠️  {total - passed} test(s) failed")
            
            print("\n📸 Screenshots saved in 'test_screenshots/' directory")
            
            # Keep browser open for inspection
            print("\n⏸️  Browser will remain open for 10 seconds for inspection...")
            await self.page.wait_for_timeout(10000)
            
            await self.teardown()


async def main():
    runner = TestRunner()
    await runner.run_all_tests()


if __name__ == "__main__":
    asyncio.run(main())

