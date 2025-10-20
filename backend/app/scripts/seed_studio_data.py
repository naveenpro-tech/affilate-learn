"""
Seed data for Community AI Studio
Creates initial categories and templates
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.core.database import SessionLocal
from app.models.studio import ImageCategory, ImageTemplate
from app.models.user import User


def seed_categories(db):
    """Create initial image categories"""
    categories = [
        {
            "name": "Marketing",
            "description": "Marketing materials, ads, and promotional content",
            "display_order": 1,
        },
        {
            "name": "Social Media",
            "description": "Social media posts, stories, and profile images",
            "display_order": 2,
        },
        {
            "name": "E-commerce",
            "description": "Product images, banners, and promotional graphics",
            "display_order": 3,
        },
        {
            "name": "Education",
            "description": "Educational content, infographics, and learning materials",
            "display_order": 4,
        },
        {
            "name": "Creative",
            "description": "Artistic and creative designs",
            "display_order": 5,
        },
    ]
    
    created_categories = []
    for cat_data in categories:
        # Check if category already exists
        existing = db.query(ImageCategory).filter(
            ImageCategory.name == cat_data["name"]
        ).first()
        
        if not existing:
            category = ImageCategory(**cat_data)
            db.add(category)
            db.commit()
            db.refresh(category)
            created_categories.append(category)
            print(f"✅ Created category: {category.name}")
        else:
            created_categories.append(existing)
            print(f"⏭️  Category already exists: {existing.name}")
    
    return created_categories


def seed_templates(db, categories):
    """Create initial image templates"""
    
    # Get admin user for created_by
    admin = db.query(User).filter(User.is_admin == True).first()
    admin_id = admin.id if admin else None
    
    templates_data = [
        # Marketing Templates
        {
            "category": "Marketing",
            "templates": [
                {
                    "title": "Product Launch Banner",
                    "prompt_text": "A professional product launch banner with vibrant colors, modern design, featuring a smartphone in the center with glowing effects and text 'New Launch'",
                    "description": "Eye-catching banner for product launches",
                },
                {
                    "title": "Sale Promotion Poster",
                    "prompt_text": "A bold sale promotion poster with red and yellow colors, large '50% OFF' text, shopping bags, and excited customers",
                    "description": "Attention-grabbing sale promotion design",
                },
                {
                    "title": "Brand Advertisement",
                    "prompt_text": "A sleek brand advertisement with minimalist design, luxury feel, elegant typography, and premium product showcase",
                    "description": "Professional brand advertising material",
                },
            ]
        },
        # Social Media Templates
        {
            "category": "Social Media",
            "templates": [
                {
                    "title": "Instagram Story Template",
                    "prompt_text": "A trendy Instagram story design with gradient background, modern fonts, emoji elements, and space for text overlay",
                    "description": "Perfect for Instagram stories",
                },
                {
                    "title": "Facebook Cover Photo",
                    "prompt_text": "A professional Facebook cover photo with panoramic landscape, business theme, company logo space, and inspiring message",
                    "description": "Professional Facebook cover design",
                },
                {
                    "title": "Twitter Header Image",
                    "prompt_text": "A creative Twitter header with abstract patterns, brand colors, dynamic composition, and modern aesthetic",
                    "description": "Eye-catching Twitter header",
                },
            ]
        },
        # E-commerce Templates
        {
            "category": "E-commerce",
            "templates": [
                {
                    "title": "Product Showcase",
                    "prompt_text": "A clean product showcase image with white background, professional lighting, product in center, shadows and reflections",
                    "description": "Professional product photography style",
                },
                {
                    "title": "Flash Sale Banner",
                    "prompt_text": "An energetic flash sale banner with lightning effects, countdown timer design, urgent messaging, and bright colors",
                    "description": "Urgent flash sale promotion",
                },
                {
                    "title": "Category Banner",
                    "prompt_text": "A stylish category banner for online store, featuring multiple products, organized layout, and category name in bold",
                    "description": "Organize products by category",
                },
            ]
        },
        # Education Templates
        {
            "category": "Education",
            "templates": [
                {
                    "title": "Infographic Design",
                    "prompt_text": "An educational infographic with charts, graphs, icons, step-by-step process, colorful sections, and data visualization",
                    "description": "Visual learning material",
                },
                {
                    "title": "Course Thumbnail",
                    "prompt_text": "A professional course thumbnail with book icons, graduation cap, learning symbols, and course title space",
                    "description": "Attractive course cover image",
                },
                {
                    "title": "Study Guide Cover",
                    "prompt_text": "A clean study guide cover with academic theme, notebook design, pencil and ruler elements, and subject title",
                    "description": "Educational material cover",
                },
            ]
        },
        # Creative Templates
        {
            "category": "Creative",
            "templates": [
                {
                    "title": "Abstract Art",
                    "prompt_text": "An abstract art piece with flowing colors, geometric shapes, dynamic composition, and modern artistic style",
                    "description": "Creative abstract design",
                },
                {
                    "title": "Nature Landscape",
                    "prompt_text": "A beautiful nature landscape with mountains, sunset, lake reflection, vibrant colors, and peaceful atmosphere",
                    "description": "Scenic nature photography",
                },
                {
                    "title": "Digital Illustration",
                    "prompt_text": "A creative digital illustration with cartoon style, vibrant colors, character design, and playful composition",
                    "description": "Fun digital artwork",
                },
            ]
        },
    ]
    
    created_count = 0
    for cat_data in templates_data:
        # Find category
        category = next((c for c in categories if c.name == cat_data["category"]), None)
        if not category:
            print(f"⚠️  Category not found: {cat_data['category']}")
            continue
        
        for template_data in cat_data["templates"]:
            # Check if template already exists
            existing = db.query(ImageTemplate).filter(
                ImageTemplate.title == template_data["title"],
                ImageTemplate.category_id == category.id
            ).first()
            
            if not existing:
                template = ImageTemplate(
                    **template_data,
                    category_id=category.id,
                    created_by=admin_id,
                )
                db.add(template)
                db.commit()
                db.refresh(template)
                created_count += 1
                print(f"✅ Created template: {template.title} ({category.name})")
            else:
                print(f"⏭️  Template already exists: {existing.title}")
    
    print(f"\n✅ Created {created_count} templates")


def main():
    """Main seeding function"""
    print("🌱 Seeding Studio data...\n")
    
    db = SessionLocal()
    try:
        # Seed categories
        print("📁 Creating categories...")
        categories = seed_categories(db)
        print()
        
        # Seed templates
        print("📝 Creating templates...")
        seed_templates(db, categories)
        print()
        
        print("✅ Studio data seeding complete!")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()

