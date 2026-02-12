from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Boolean, Enum, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Admin(Base):
    __tablename__ = "admin"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(15))
    created_at = Column(TIMESTAMP, server_default=func.now())

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(15))
    role = Column(Enum('Student', 'Alumni'), default='Student')
    status = Column(Enum('PENDING', 'APPROVED'), default='PENDING')
    created_at = Column(TIMESTAMP, server_default=func.now())
    reg_no = Column(String(50))
    course = Column(String(100))
    batch = Column(String(50))
    session = Column(String(50))

    academic = relationship("StudentAcademic", back_populates="student", uselist=False)
    experience = relationship("StudentExperience", back_populates="student")
    profile = relationship("StudentProfile", back_populates="student", uselist=False)
    posts = relationship("Post", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    mentorship_requests_sent = relationship("MentorshipRequest", foreign_keys="[MentorshipRequest.student_id]", back_populates="student")
    mentorship_requests_received = relationship("MentorshipRequest", foreign_keys="[MentorshipRequest.mentor_id]", back_populates="mentor")

class StudentAcademic(Base):
    __tablename__ = "student_academic"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"))
    enrollment_no = Column(String(50))
    degree = Column(String(50))
    specialization = Column(String(100))
    department = Column(String(100))
    year = Column(Enum('1st', '2nd'))
    batch = Column(String(20))

    student = relationship("Student", back_populates="academic")

class StudentExperience(Base):
    __tablename__ = "student_experience"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"))
    company_name = Column(String(150))
    role = Column(String(100))
    experience_type = Column(Enum('Internship', 'Job', 'Freelance'))
    start_date = Column(Date)
    end_date = Column(Date)
    description = Column(Text)

    student = relationship("Student", back_populates="experience")

class StudentProfile(Base):
    __tablename__ = "student_profile"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"))
    skills = Column(Text)
    bio = Column(Text)
    achievements = Column(Text)

    student = relationship("Student", back_populates="profile")

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("students.id"))
    content = Column(Text)
    image = Column(Text)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("Student", back_populates="posts")
    comments = relationship("Comment", back_populates="post")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    user_id = Column(Integer, ForeignKey("students.id"))
    text = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    post = relationship("Post", back_populates="comments")
    user = relationship("Student", back_populates="comments")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    type = Column(String(50))
    audience = Column(String(50))
    date = Column(Date)
    time = Column(String(50))
    location = Column(String(255))
    description = Column(Text)
    image = Column(Text)
    attendees = Column(Integer, default=0)

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    type = Column(String(50))
    location = Column(String(255))
    posted_date = Column(DateTime, server_default=func.now())
    description = Column(Text)
    is_active = Column(Boolean, default=True)

    applications = relationship("JobApplication", back_populates="job")

class MentorshipRequest(Base):
    __tablename__ = "mentorship_requests"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    mentor_id = Column(Integer, ForeignKey("students.id"))
    message = Column(Text)
    status = Column(String(50), default='Pending')
    created_at = Column(DateTime, server_default=func.now())

    student = relationship("Student", foreign_keys=[student_id], back_populates="mentorship_requests_sent")
    mentor = relationship("Student", foreign_keys=[mentor_id], back_populates="mentorship_requests_received")

# New Tables found in mockData but missing in SQL
class JobApplication(Base):
    __tablename__ = "job_applications"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    status = Column(String(50), default='Applied')
    applied_date = Column(DateTime, server_default=func.now())

    job = relationship("Job", back_populates="applications")
    student = relationship("Student")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("students.id"))
    text = Column(Text)
    read = Column(Boolean, default=False)
    type = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())
