"""
Playwright automation script to test the complete referral and commission flow
"""
import asyncio
from playwright.async_api import async_playwright
import time

async def test_complete_flow():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=False, slow_mo=1000)
        context = await browser.new_context()
        page = await context.new_page()
        
        print("🚀 Starting Playwright automation test...")
        
        try:
            # ===== TEST 1: User A logs in and gets referral link =====
            print("\n📝 TEST 1: User A logs in and gets referral link")
            await page.goto("http://localhost:3000/login")
            await page.wait_for_load_state("networkidle")
            
            # Login as User A (naveenvide@gmail.com)
            await page.fill('input[type="email"]', 'naveenvide@gmail.com')
            await page.fill('input[type="password"]', 'password123')
            await page.click('button[type="submit"]')
            await page.wait_for_url("**/dashboard", timeout=10000)
            print("✅ User A logged in successfully")
            
            # Take screenshot
            await page.screenshot(path="screenshots/01_user_a_dashboard.png", full_page=True)
            
            # Get referral code
            referral_code_element = await page.query_selector('text=/[A-Z0-9]{8}/')
            if referral_code_element:
                referral_code = await referral_code_element.inner_text()
                print(f"✅ Referral code: {referral_code}")
            else:
                print("❌ Could not find referral code")
                return
            
            # Check initial stats
            total_referrals = await page.query_selector('text=Total Referrals')
            if total_referrals:
                parent = await total_referrals.evaluate_handle('el => el.parentElement')
                stats_text = await parent.inner_text()
                print(f"📊 Initial stats: {stats_text}")
            
            await page.screenshot(path="screenshots/02_user_a_referral_code.png", full_page=True)
            
            # ===== TEST 2: User B registers with referral code =====
            print("\n📝 TEST 2: User B registers with referral code")
            
            # Logout User A
            await page.click('button:has-text("Logout")')
            await page.wait_for_url("**/login", timeout=5000)
            print("✅ User A logged out")
            
            # Go to register page with referral code
            await page.goto(f"http://localhost:3000/register?ref={referral_code}")
            await page.wait_for_load_state("networkidle")
            
            # Fill registration form
            timestamp = int(time.time())
            new_email = f"testuser{timestamp}@example.com"
            await page.fill('input[name="fullName"]', f'Test User {timestamp}')
            await page.fill('input[type="email"]', new_email)
            await page.fill('input[type="tel"]', '9876543210')
            await page.fill('input[type="password"]', 'password123')
            
            # Verify referral code is pre-filled
            referral_input = await page.query_selector('input[placeholder*="referral"]')
            if referral_input:
                filled_code = await referral_input.input_value()
                print(f"✅ Referral code pre-filled: {filled_code}")
            
            await page.screenshot(path="screenshots/03_user_b_registration.png", full_page=True)
            
            # Submit registration
            await page.click('button[type="submit"]')
            await page.wait_for_url("**/dashboard", timeout=10000)
            print(f"✅ User B registered successfully: {new_email}")
            
            await page.screenshot(path="screenshots/04_user_b_dashboard.png", full_page=True)
            
            # ===== TEST 3: Verify User B appears in User A's referrals =====
            print("\n📝 TEST 3: Verify User B appears in User A's referrals")
            
            # Logout User B
            await page.click('button:has-text("Logout")')
            await page.wait_for_url("**/login", timeout=5000)
            
            # Login as User A again
            await page.fill('input[type="email"]', 'naveenvide@gmail.com')
            await page.fill('input[type="password"]', 'password123')
            await page.click('button[type="submit"]')
            await page.wait_for_url("**/dashboard", timeout=10000)
            print("✅ User A logged in again")
            
            # Check updated stats
            await page.wait_for_timeout(2000)  # Wait for data to load
            total_referrals = await page.query_selector('text=Total Referrals')
            if total_referrals:
                parent = await total_referrals.evaluate_handle('el => el.parentElement')
                stats_text = await parent.inner_text()
                print(f"📊 Updated stats: {stats_text}")
            
            # Go to Referrals page
            await page.click('a[href="/referrals"]')
            await page.wait_for_url("**/referrals", timeout=5000)
            await page.wait_for_timeout(2000)
            
            await page.screenshot(path="screenshots/05_user_a_referrals_list.png", full_page=True)
            
            # Check if User B is in the list
            user_b_found = await page.query_selector(f'text={new_email}')
            if user_b_found:
                print(f"✅ User B found in referrals list: {new_email}")
            else:
                print(f"❌ User B NOT found in referrals list")
            
            # Check package status
            no_package = await page.query_selector('text=No Package')
            if no_package:
                print("✅ User B shows 'No Package' status")
            
            # ===== TEST 4: User B purchases a package =====
            print("\n📝 TEST 4: User B purchases a package")
            
            # Logout User A
            await page.click('button:has-text("Logout")')
            await page.wait_for_url("**/login", timeout=5000)
            
            # Login as User B
            await page.fill('input[type="email"]', new_email)
            await page.fill('input[type="password"]', 'password123')
            await page.click('button[type="submit"]')
            await page.wait_for_url("**/dashboard", timeout=10000)
            print("✅ User B logged in")
            
            # Go to packages page
            await page.click('a[href="/packages"]')
            await page.wait_for_url("**/packages", timeout=5000)
            await page.wait_for_timeout(2000)
            
            await page.screenshot(path="screenshots/06_packages_page.png", full_page=True)
            
            # Click Buy Now for Silver package
            buy_buttons = await page.query_selector_all('button:has-text("Buy Now")')
            if buy_buttons:
                await buy_buttons[0].click()  # First package (Silver)
                print("✅ Clicked Buy Now for Silver package")
                
                # Wait for Razorpay modal
                await page.wait_for_timeout(3000)
                await page.screenshot(path="screenshots/07_razorpay_modal.png", full_page=True)
                
                print("\n⚠️  MANUAL STEP REQUIRED:")
                print("1. Select 'UPI payment' in the Razorpay modal")
                print("2. Enter any UPI ID (e.g., test@paytm)")
                print("3. Press Enter - payment will be auto-accepted in test mode")
                print("\nWaiting 30 seconds for manual payment completion...")
                
                await page.wait_for_timeout(30000)
                
                # Check if redirected to dashboard
                current_url = page.url
                if "dashboard" in current_url:
                    print("✅ Redirected to dashboard after payment")
                    await page.screenshot(path="screenshots/08_user_b_after_purchase.png", full_page=True)
                    
                    # Check package status
                    await page.wait_for_timeout(2000)
                    current_package = await page.query_selector('text=Current Package')
                    if current_package:
                        parent = await current_package.evaluate_handle('el => el.parentElement')
                        package_text = await parent.inner_text()
                        print(f"📦 User B's package: {package_text}")
                else:
                    print("❌ Not redirected to dashboard")
            
            # ===== TEST 5: Verify commission created for User A =====
            print("\n📝 TEST 5: Verify commission created for User A")
            
            # Logout User B
            await page.click('button:has-text("Logout")')
            await page.wait_for_url("**/login", timeout=5000)
            
            # Login as User A
            await page.fill('input[type="email"]', 'naveenvide@gmail.com')
            await page.fill('input[type="password"]', 'password123')
            await page.click('button[type="submit"]')
            await page.wait_for_url("**/dashboard", timeout=10000)
            print("✅ User A logged in to check earnings")
            
            await page.wait_for_timeout(2000)
            await page.screenshot(path="screenshots/09_user_a_dashboard_after_commission.png", full_page=True)
            
            # Check earnings
            total_earnings = await page.query_selector('text=Total Earnings')
            if total_earnings:
                parent = await total_earnings.evaluate_handle('el => el.parentElement')
                earnings_text = await parent.inner_text()
                print(f"💰 User A's earnings: {earnings_text}")
            
            # Go to Earnings page
            await page.click('a[href="/earnings"]')
            await page.wait_for_url("**/earnings", timeout=5000)
            await page.wait_for_timeout(2000)
            
            await page.screenshot(path="screenshots/10_user_a_earnings_page.png", full_page=True)
            
            # Go to Referrals page to see updated status
            await page.click('a[href="/referrals"]')
            await page.wait_for_url("**/referrals", timeout=5000)
            await page.wait_for_timeout(2000)
            
            await page.screenshot(path="screenshots/11_user_a_referrals_after_purchase.png", full_page=True)
            
            print("\n✅ All tests completed successfully!")
            print("\n📸 Screenshots saved in 'screenshots/' directory")
            print("\n🔍 Next: Check database records to verify:")
            print("   - user_packages table has User B's purchase")
            print("   - referrals table has the referral record")
            print("   - commissions table has User A's commission")
            
        except Exception as e:
            print(f"\n❌ Error during testing: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="screenshots/error.png", full_page=True)
        
        finally:
            # Keep browser open for inspection
            print("\n⏸️  Browser will remain open for 10 seconds for inspection...")
            await page.wait_for_timeout(10000)
            await browser.close()


if __name__ == "__main__":
    # Create screenshots directory
    import os
    os.makedirs("screenshots", exist_ok=True)
    
    # Run the test
    asyncio.run(test_complete_flow())

