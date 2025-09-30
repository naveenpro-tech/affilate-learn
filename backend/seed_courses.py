"""
Seed demo courses for testing
"""
from app.core.database import SessionLocal
from app.models.course import Course
from app.models.package import Package

def seed_courses():
    db = SessionLocal()
    
    try:
        # Get packages
        silver = db.query(Package).filter(Package.name == "Silver").first()
        gold = db.query(Package).filter(Package.name == "Gold").first()
        platinum = db.query(Package).filter(Package.name == "Platinum").first()
        
        if not all([silver, gold, platinum]):
            print("Error: Packages not found. Run seed_packages.py first.")
            return
        
        # Check if courses already exist
        existing_count = db.query(Course).count()
        if existing_count > 0:
            print(f"Courses already exist ({existing_count} courses). Skipping seed.")
            return
        
        # Demo courses data - matching Course model structure
        courses_data = [
            # Silver Package Courses (5 basic courses)
            {"title": "Introduction to Digital Marketing", "slug": "intro-digital-marketing", "description": "Learn the fundamentals of digital marketing including SEO, social media, and content marketing. Perfect for beginners.", "thumbnail_url": "https://via.placeholder.com/400x300?text=Digital+Marketing", "package_id": silver.id, "display_order": 1, "is_published": True},
            {"title": "Social Media Marketing Basics", "slug": "social-media-basics", "description": "Master the basics of social media marketing across Facebook, Instagram, and Twitter. Build your brand presence.", "thumbnail_url": "https://via.placeholder.com/400x300?text=Social+Media", "package_id": silver.id, "display_order": 2, "is_published": True},
            {"title": "Email Marketing Fundamentals", "slug": "email-marketing-fundamentals", "description": "Learn how to create effective email campaigns that convert. Master email automation and segmentation.", "thumbnail_url": "https://via.placeholder.com/400x300?text=Email+Marketing", "package_id": silver.id, "display_order": 3, "is_published": True},
            {"title": "Content Writing for Beginners", "slug": "content-writing-beginners", "description": "Develop your content writing skills for blogs, websites, and social media. Learn SEO writing techniques.", "thumbnail_url": "https://via.placeholder.com/400x300?text=Content+Writing", "package_id": silver.id, "display_order": 4, "is_published": True},
            {"title": "Basic SEO Techniques", "slug": "basic-seo-techniques", "description": "Understand the fundamentals of Search Engine Optimization. Learn keyword research and on-page SEO.", "thumbnail_url": "https://via.placeholder.com/400x300?text=SEO+Basics", "package_id": silver.id, "display_order": 5, "is_published": True},
            
            # Gold Package Courses (5 additional intermediate courses)
            {"title": "Advanced Social Media Strategies", "slug": "advanced-social-media", "description": "Take your social media marketing to the next level with advanced strategies. Learn influencer marketing and paid social.", "thumbnail_url": "https://via.placeholder.com/400x300?text=Advanced+Social", "package_id": gold.id, "display_order": 6, "is_published": True},
            {"title": "Google Ads Mastery", "slug": "google-ads-mastery", "description": "Master Google Ads and PPC advertising for maximum ROI. Learn campaign optimization and bidding strategies.", "thumbnail_url": "https://via.placeholder.com/400x300?text=Google+Ads", "package_id": gold.id, "display_order": 7, "is_published": True},
            {"title": "Facebook Ads Complete Guide", "slug": "facebook-ads-guide", "description": "Learn to create high-converting Facebook and Instagram ad campaigns. Master audience targeting and retargeting.", "thumbnail_url": "https://via.placeholder.com/400x300?text=Facebook+Ads", "package_id": gold.id, "display_order": 8, "is_published": True},
            {"title": "Conversion Rate Optimization", "slug": "conversion-optimization", "description": "Optimize your website and landing pages for maximum conversions. Learn A/B testing and user experience design.", "thumbnail_url": "https://via.placeholder.com/400x300?text=CRO", "package_id": gold.id, "display_order": 9, "is_published": True},
            {"title": "Marketing Analytics & Data", "slug": "marketing-analytics", "description": "Learn to analyze marketing data and make data-driven decisions. Master Google Analytics and reporting.", "thumbnail_url": "https://via.placeholder.com/400x300?text=Analytics", "package_id": gold.id, "display_order": 10, "is_published": True},
            
            # Platinum Package Courses (5 advanced courses)
            {"title": "Advanced SEO & Technical SEO", "slug": "advanced-seo", "description": "Master advanced SEO techniques and technical optimization. Learn site architecture and Core Web Vitals.", "thumbnail_url": "https://via.placeholder.com/400x300?text=Advanced+SEO", "package_id": platinum.id, "display_order": 11, "is_published": True},
            {"title": "Marketing Automation Mastery", "slug": "marketing-automation", "description": "Automate your marketing with advanced tools and strategies. Master HubSpot, Marketo, and automation workflows.", "thumbnail_url": "https://via.placeholder.com/400x300?text=Automation", "package_id": platinum.id, "display_order": 12, "is_published": True},
            {"title": "Influencer Marketing Strategy", "slug": "influencer-marketing", "description": "Build and execute successful influencer marketing campaigns. Learn partnership strategies and ROI measurement.", "thumbnail_url": "https://via.placeholder.com/400x300?text=Influencer", "package_id": platinum.id, "display_order": 13, "is_published": True},
            {"title": "Growth Hacking Techniques", "slug": "growth-hacking", "description": "Learn cutting-edge growth hacking strategies for rapid business growth. Master viral loops and product-led growth.", "thumbnail_url": "https://via.placeholder.com/400x300?text=Growth+Hacking", "package_id": platinum.id, "display_order": 14, "is_published": True},
            {"title": "Complete Marketing Strategy", "slug": "complete-marketing-strategy", "description": "Develop comprehensive marketing strategies for any business. Learn strategic planning and execution frameworks.", "thumbnail_url": "https://via.placeholder.com/400x300?text=Strategy", "package_id": platinum.id, "display_order": 15, "is_published": True},
        ]
        
        # Create courses
        for course_data in courses_data:
            course = Course(**course_data)
            db.add(course)
        
        db.commit()
        print(f"✅ Successfully created {len(courses_data)} demo courses!")
        print("\nCourse Distribution:")
        print(f"- Silver Package (ID: {silver.id}): 5 courses")
        print(f"- Gold Package (ID: {gold.id}): 5 additional courses (10 total)")
        print(f"- Platinum Package (ID: {platinum.id}): 5 additional courses (15 total)")
        print("\nNote: Users with higher-tier packages can access all lower-tier courses too.")
        
    except Exception as e:
        print(f"❌ Error seeding courses: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_courses()

