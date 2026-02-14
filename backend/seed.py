from app import models, database, utils, schemas
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

def seed_data():
    db = database.SessionLocal()
    
    print("Clearing existing data...")
    try:
        db.query(models.Report).delete()
        db.query(models.PostLike).delete()
        db.query(models.Comment).delete()
        db.query(models.Post).delete()
        db.query(models.Notification).delete()
        db.query(models.EventAttendee).delete()
        db.query(models.MentorshipRequest).delete()
        db.query(models.Job).delete()
        db.query(models.Event).delete()
        db.query(models.StudentAcademic).delete()
        db.query(models.Student).delete()
        db.query(models.Admin).delete()
        db.commit()
    except Exception as e:
        print(f"Error clearing data: {e}")
        db.rollback()

    print("Seeding Admin...")
    admin_password = utils.get_password_hash("admin123")
    admin = models.Admin(
        email="admin@collegehub.com",
        name="System Admin",
        password=admin_password
    )
    db.add(admin)
    db.commit()

    print("Seeding Students...")
    students = []
    student_password = utils.get_password_hash("password")
    
    # Create main test user
    test_student = models.Student(
        email="student1@test.com",
        name="Rahul Sharma",
        password=student_password,
        role="Student"
    )
    db.add(test_student)
    students.append(test_student)
    
    # Create more students
    for i in range(2, 6):
        s = models.Student(
            email=f"student{i}@test.com",
            name=f"Student {i}",
            password=student_password,
            role="Student"
        )
        db.add(s)
        students.append(s)
    db.commit()
    
    # Refresh to get IDs
    for s in students:
        db.refresh(s)

    print("Seeding Notifications...")
    notifications = [
        {"user_id": students[0].id, "text": "Your application for Software Intern at TechCorp was received.", "type": "success", "read": False},
        {"user_id": students[0].id, "text": "New event 'Tech Talk' added in your department.", "type": "info", "read": False},
        {"user_id": students[0].id, "text": "Reminder: Complete your profile to get better recommendations.", "type": "warning", "read": True},
    ]
    
    for n in notifications:
        db.add(models.Notification(**n))
    db.commit()

    print("Seeding Events...")
    events = [
        {"title": "Tech Symposium 2024", "type": "Academic", "audience": "All", "date": (datetime.now() + timedelta(days=5)).isoformat(), "location": "Main Auditorium", "description": "Annual tech symposium."},
        {"title": "Career Fair", "type": "Career", "audience": "Final Year", "date": (datetime.now() + timedelta(days=10)).isoformat(), "location": "Campus Grounds", "description": "Meet top recruiters."},
    ]
    
    for e in events:
        db_event = models.Event(**e)
        db.add(db_event)
    db.commit()

    print("Seeding Jobs...")
    jobs = [
        {"title": "Software Engineer Intern", "company": "TechCorp", "type": "Internship", "location": "Bangalore", "description": "3 month internship."},
        {"title": "Junior Developer", "company": "StartUp Inc", "type": "Full Time", "location": "Remote", "description": "React developer needed."},
    ]
    for j in jobs:
        db_job = models.Job(**j)
        db.add(db_job)
    db.commit()

    print("Seeding Pending Users...")
    pending_student = models.Student(
        email="pending@test.com",
        name="Pending User",
        password=student_password,
        role="Student",
        status="Pending"
    )
    db.add(pending_student)
    db.commit()

    print("Seeding Reports...")
    # Report against student 1
    report = models.Report(
        reporter_id=students[1].id,
        target_id=students[0].id,
        target_type="User",
        reason="Harassment",
        description="User is sending spam messages.",
        status="Pending"
    )
    db.add(report)
    db.commit()

    print("Seeding Posts...")
    posts = [
        {"user_id": students[0].id, "content": "Just finished my final project! Can't wait to graduate.", "likes_count": 5},
        {"user_id": students[1].id, "content": "Anyone know when the career fair starts?", "likes_count": 2},
        {"user_id": students[0].id, "content": "Looking for team members for the hackathon next week.", "likes_count": 0},
    ]
    for p in posts:
        db_post = models.Post(**p)
        db.add(db_post)
    db.commit()

    print("Seeding Completed!")
    db.close()

if __name__ == "__main__":
    seed_data()
