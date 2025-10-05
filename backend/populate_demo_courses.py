"""
Populate database with demo courses containing real YouTube content
"""
import sys
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine

# Import all models to ensure relationships are properly configured
from app.models.user import User
from app.models.package import Package
from app.models.course import Course
from app.models.module import Module
from app.models.topic import Topic
from app.models.notification import Notification
from app.models.wallet import Wallet
from app.models.referral import Referral
from app.models.commission import Commission

# Create tables
from app.core.database import Base
Base.metadata.create_all(bind=engine)

def populate_demo_courses():
    db = SessionLocal()
    
    try:
        # Get packages
        silver = db.query(Package).filter(Package.name == "Silver").first()
        gold = db.query(Package).filter(Package.name == "Gold").first()
        platinum = db.query(Package).filter(Package.name == "Platinum").first()
        
        if not silver or not gold or not platinum:
            print("Error: Packages not found. Please create packages first.")
            return
        
        print("Creating demo courses...")
        
        # Course 1: Python for Beginners (Package + Individual Purchase)
        course1 = Course(
            title="Python Programming for Beginners",
            slug="python-programming-for-beginners",
            description="Learn Python from scratch with hands-on examples. Perfect for absolute beginners who want to start their programming journey.",
            package_id=silver.id,
            individual_price=299.0,
            available_for_individual_purchase=True,
            is_published=True,
            display_order=1
        )
        db.add(course1)
        db.flush()
        
        # Module 1.1: Introduction to Python
        module1_1 = Module(
            course_id=course1.id,
            title="Introduction to Python",
            description="Get started with Python programming basics",
            display_order=0,
            is_published=True
        )
        db.add(module1_1)
        db.flush()
        
        # Topics for Module 1.1
        topics_1_1 = [
            {"title": "What is Python?", "url": "https://www.youtube.com/watch?v=Y8Tko2YC5hA", "duration": 360},
            {"title": "Installing Python", "url": "https://www.youtube.com/watch?v=YYXdXT2l-Gg", "duration": 480},
            {"title": "Your First Python Program", "url": "https://www.youtube.com/watch?v=KSiRzuSx120", "duration": 420},
        ]
        
        for idx, topic_data in enumerate(topics_1_1):
            topic = Topic(
                module_id=module1_1.id,
                title=topic_data["title"],
                description=f"Learn about {topic_data['title'].lower()}",
                video_source_type="external",
                external_video_url=topic_data["url"],
                duration=topic_data["duration"],
                display_order=idx,
                is_published=True
            )
            db.add(topic)
        
        # Module 1.2: Python Basics
        module1_2 = Module(
            course_id=course1.id,
            title="Python Basics",
            description="Learn fundamental Python concepts",
            display_order=1,
            is_published=True
        )
        db.add(module1_2)
        db.flush()
        
        topics_1_2 = [
            {"title": "Variables and Data Types", "url": "https://www.youtube.com/watch?v=LKYFdHUuKsU", "duration": 540},
            {"title": "Operators in Python", "url": "https://www.youtube.com/watch?v=v5MR5JnKcZI", "duration": 600},
            {"title": "Control Flow - If Statements", "url": "https://www.youtube.com/watch?v=f4KOjWS_KZs", "duration": 720},
        ]
        
        for idx, topic_data in enumerate(topics_1_2):
            topic = Topic(
                module_id=module1_2.id,
                title=topic_data["title"],
                description=f"Master {topic_data['title'].lower()}",
                video_source_type="external",
                external_video_url=topic_data["url"],
                duration=topic_data["duration"],
                display_order=idx,
                is_published=True
            )
            db.add(topic)
        
        print(f"✅ Created: {course1.title}")
        
        # Course 2: Web Development with HTML & CSS (Individual Purchase Only)
        course2 = Course(
            title="Complete Web Development - HTML & CSS",
            slug="complete-web-development-html-css",
            description="Build beautiful websites from scratch. Learn HTML5 and CSS3 with real-world projects.",
            package_id=silver.id,
            individual_price=399.0,
            available_for_individual_purchase=True,
            is_published=True,
            display_order=2
        )
        db.add(course2)
        db.flush()
        
        module2_1 = Module(
            course_id=course2.id,
            title="HTML Fundamentals",
            description="Master HTML5 from basics to advanced",
            display_order=0,
            is_published=True
        )
        db.add(module2_1)
        db.flush()
        
        topics_2_1 = [
            {"title": "HTML Introduction", "url": "https://www.youtube.com/watch?v=qz0aGYrrlhU", "duration": 900},
            {"title": "HTML Elements and Tags", "url": "https://www.youtube.com/watch?v=MDLn5-zSQQI", "duration": 1200},
            {"title": "HTML Forms", "url": "https://www.youtube.com/watch?v=fNcJuPIZ2WE", "duration": 1500},
        ]
        
        for idx, topic_data in enumerate(topics_2_1):
            topic = Topic(
                module_id=module2_1.id,
                title=topic_data["title"],
                description=f"Learn {topic_data['title'].lower()}",
                video_source_type="external",
                external_video_url=topic_data["url"],
                duration=topic_data["duration"],
                display_order=idx,
                is_published=True
            )
            db.add(topic)
        
        module2_2 = Module(
            course_id=course2.id,
            title="CSS Mastery",
            description="Style your websites like a pro",
            display_order=1,
            is_published=True
        )
        db.add(module2_2)
        db.flush()
        
        topics_2_2 = [
            {"title": "CSS Basics", "url": "https://www.youtube.com/watch?v=1PnVor36_40", "duration": 1800},
            {"title": "CSS Flexbox", "url": "https://www.youtube.com/watch?v=JJSoEo8JSnc", "duration": 2100},
            {"title": "CSS Grid", "url": "https://www.youtube.com/watch?v=EFafSYg-PkI", "duration": 1800},
        ]
        
        for idx, topic_data in enumerate(topics_2_2):
            topic = Topic(
                module_id=module2_2.id,
                title=topic_data["title"],
                description=f"Master {topic_data['title'].lower()}",
                video_source_type="external",
                external_video_url=topic_data["url"],
                duration=topic_data["duration"],
                display_order=idx,
                is_published=True
            )
            db.add(topic)
        
        print(f"✅ Created: {course2.title}")
        
        # Course 3: JavaScript Essentials (Package Only - Gold)
        course3 = Course(
            title="JavaScript Essentials for Modern Web",
            slug="javascript-essentials-modern-web",
            description="Master JavaScript ES6+ features and build interactive web applications.",
            package_id=gold.id,
            individual_price=499.0,
            available_for_individual_purchase=False,  # Package only
            is_published=True,
            display_order=3
        )
        db.add(course3)
        db.flush()
        
        module3_1 = Module(
            course_id=course3.id,
            title="JavaScript Fundamentals",
            description="Core JavaScript concepts every developer must know",
            display_order=0,
            is_published=True
        )
        db.add(module3_1)
        db.flush()
        
        topics_3_1 = [
            {"title": "JavaScript Introduction", "url": "https://www.youtube.com/watch?v=W6NZfCO5SIk", "duration": 1200},
            {"title": "Variables and Data Types", "url": "https://www.youtube.com/watch?v=9emXNzqCKyg", "duration": 900},
            {"title": "Functions in JavaScript", "url": "https://www.youtube.com/watch?v=N8ap4k_1QEQ", "duration": 1500},
            {"title": "Arrays and Objects", "url": "https://www.youtube.com/watch?v=R8rmfD9Y5-c", "duration": 1800},
        ]
        
        for idx, topic_data in enumerate(topics_3_1):
            topic = Topic(
                module_id=module3_1.id,
                title=topic_data["title"],
                description=f"Learn {topic_data['title'].lower()}",
                video_source_type="external",
                external_video_url=topic_data["url"],
                duration=topic_data["duration"],
                display_order=idx,
                is_published=True
            )
            db.add(topic)
        
        print(f"✅ Created: {course3.title}")
        
        # Course 4: React.js Complete Guide (Platinum + Individual)
        course4 = Course(
            title="React.js - The Complete Guide",
            slug="reactjs-complete-guide",
            description="Build modern, reactive user interfaces with React. Includes hooks, context, and advanced patterns.",
            package_id=platinum.id,
            individual_price=799.0,
            available_for_individual_purchase=True,
            is_published=True,
            display_order=4
        )
        db.add(course4)
        db.flush()
        
        module4_1 = Module(
            course_id=course4.id,
            title="React Basics",
            description="Get started with React fundamentals",
            display_order=0,
            is_published=True
        )
        db.add(module4_1)
        db.flush()
        
        topics_4_1 = [
            {"title": "What is React?", "url": "https://www.youtube.com/watch?v=Tn6-PIqc4UM", "duration": 2400},
            {"title": "Components and Props", "url": "https://www.youtube.com/watch?v=m7OWXtbiXX8", "duration": 1800},
            {"title": "State and Lifecycle", "url": "https://www.youtube.com/watch?v=-bEzt5ISACA", "duration": 2100},
        ]
        
        for idx, topic_data in enumerate(topics_4_1):
            topic = Topic(
                module_id=module4_1.id,
                title=topic_data["title"],
                description=f"Understand {topic_data['title'].lower()}",
                video_source_type="external",
                external_video_url=topic_data["url"],
                duration=topic_data["duration"],
                display_order=idx,
                is_published=True
            )
            db.add(topic)
        
        print(f"✅ Created: {course4.title}")
        
        # Course 5: Digital Marketing Mastery (Individual Purchase Only)
        course5 = Course(
            title="Digital Marketing Mastery 2024",
            slug="digital-marketing-mastery-2024",
            description="Complete digital marketing course covering SEO, social media, email marketing, and paid ads.",
            package_id=gold.id,
            individual_price=599.0,
            available_for_individual_purchase=True,
            is_published=True,
            display_order=5
        )
        db.add(course5)
        db.flush()
        
        module5_1 = Module(
            course_id=course5.id,
            title="SEO Fundamentals",
            description="Master search engine optimization",
            display_order=0,
            is_published=True
        )
        db.add(module5_1)
        db.flush()
        
        topics_5_1 = [
            {"title": "SEO Basics", "url": "https://www.youtube.com/watch?v=DvwS7cV9GmQ", "duration": 1800},
            {"title": "Keyword Research", "url": "https://www.youtube.com/watch?v=hOnCOjm7_Sw", "duration": 1500},
            {"title": "On-Page SEO", "url": "https://www.youtube.com/watch?v=xsVTqzratPs", "duration": 2100},
        ]
        
        for idx, topic_data in enumerate(topics_5_1):
            topic = Topic(
                module_id=module5_1.id,
                title=topic_data["title"],
                description=f"Learn {topic_data['title'].lower()}",
                video_source_type="external",
                external_video_url=topic_data["url"],
                duration=topic_data["duration"],
                display_order=idx,
                is_published=True
            )
            db.add(topic)
        
        print(f"✅ Created: {course5.title}")
        
        db.commit()
        print("\n🎉 Successfully created 5 demo courses with modules and topics!")
        print("\nCourse Summary:")
        print("1. Python Programming for Beginners (Silver + ₹299)")
        print("2. Complete Web Development - HTML & CSS (Silver + ₹399)")
        print("3. JavaScript Essentials (Gold - Package Only)")
        print("4. React.js - The Complete Guide (Platinum + ₹799)")
        print("5. Digital Marketing Mastery 2024 (Gold + ₹599)")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    populate_demo_courses()

