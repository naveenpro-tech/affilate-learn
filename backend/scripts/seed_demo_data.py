from app.core.database import SessionLocal
from app.models.course import Course
from app.models.video import Video
from app.models.package import Package
from sqlalchemy.exc import IntegrityError
# Optional dependency: python-slugify. Provide a tiny fallback if missing.
try:
    from slugify import slugify  # type: ignore
except Exception:
    def slugify(text: str) -> str:
        return text.lower().replace(' ', '-').replace('/', '-')


def upsert_course(db, title: str, package_id: int, description: str, thumbnail_url: str, display_order: int):
    slug = slugify(title)
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        course = Course(
            title=title,
            slug=slug,
            description=description,
            package_id=package_id,
            individual_price=199.0,
            available_for_individual_purchase=True,
            thumbnail_url=thumbnail_url,
            display_order=display_order,
            is_published=True,
        )
        db.add(course)
        db.commit()
        db.refresh(course)
    return course


def add_video(db, course_id: int, title: str, order: int, duration: int = 300):
    # Use Cloudinary demo video
    cloud_public_id = "samples/elephants"
    cloud_url = "https://res.cloudinary.com/demo/video/upload/samples/elephants.mp4"
    thumb_url = "https://res.cloudinary.com/demo/video/upload/samples/elephants.jpg"

    video = Video(
        course_id=course_id,
        title=title,
        description=f"Lesson: {title}",
        cloudinary_public_id=cloud_public_id,
        cloudinary_url=cloud_url,
        thumbnail_url=thumb_url,
        duration=duration,
        display_order=order,
        is_published=True,
    )
    db.add(video)


def main():
    db = SessionLocal()
    try:
        # Ensure packages exist (1,2,3)
        packages = db.query(Package).all()
        if not packages:
            print("No packages found. Please seed packages first.")
            return

        courses_data = [
            ("Introduction to Digital Marketing", 1, "Kickstart your digital marketing journey with fundamentals.", "https://images.unsplash.com/photo-1557800636-894a64c1696f", 1),
            ("Advanced SEO Strategies", 2, "Master modern SEO techniques for higher rankings.", "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40", 2),
            ("Social Media Marketing Mastery", 2, "Grow your brand with data-driven social strategies.", "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2", 3),
            ("Email Marketing Automation", 3, "Automate email campaigns that convert and retain.", "https://images.unsplash.com/photo-1492724441997-5dc865305da7", 4),
            ("Affiliate Marketing Blueprint", 3, "End-to-end system to earn via affiliate marketing.", "https://images.unsplash.com/photo-1551288049-bebda4e38f71", 5),
        ]

        created_courses = []
        for idx, (title, pkg_id, desc, thumb, order) in enumerate(courses_data, start=1):
            course = upsert_course(db, title, pkg_id, desc, thumb, order)
            created_courses.append(course)

            # Add 3 demo videos per course
            for i in range(1, 4):
                add_video(db, course.id, f"{title} - Lesson {i}", i)
            db.commit()

        print(f"Seeded {len(created_courses)} courses with demo videos.")
    except IntegrityError as e:
        db.rollback()
        print("Integrity error:", e)
    except Exception as e:
        db.rollback()
        print("Failed to seed demo data:", e)
    finally:
        db.close()


if __name__ == "__main__":
    main()

