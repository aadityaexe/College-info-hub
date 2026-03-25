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
    created_at = Column(DateTime, server_default=func.now())

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(15))
    role = Column(Enum('Student', 'Alumni'), default='Student')
    # Updated status enum to match frontend: Active, Blocked, Pending
    status = Column(Enum('Active', 'Blocked', 'Pending'), default='Pending')
    created_at = Column(DateTime, server_default=func.now())
    reg_no = Column(String(50))
    course = Column(String(100))
    batch = Column(String(50))
    session = Column(String(50))

    academic = relationship("StudentAcademic", back_populates="student", uselist=False)
    experience = relationship("StudentExperience", back_populates="student")
    profile = relationship("StudentProfile", back_populates="student", uselist=False)
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    mentorship_requests_sent = relationship("MentorshipRequest", foreign_keys="[MentorshipRequest.student_id]", back_populates="student", cascade="all, delete-orphan")
    mentorship_requests_received = relationship("MentorshipRequest", foreign_keys="[MentorshipRequest.mentor_id]", back_populates="mentor", cascade="all, delete-orphan")

    # Added for cascade delete
    reports = relationship("Report", back_populates="reporter", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    job_applications = relationship("JobApplication", back_populates="student", cascade="all, delete-orphan")
    event_attendance = relationship("EventAttendee", back_populates="student", cascade="all, delete-orphan")
    likes = relationship("PostLike", back_populates="user", cascade="all, delete-orphan")

    @property
    def bio(self):
        return self.profile.bio if self.profile else None
    
    @property
    def skills(self):
        return self.profile.skills if self.profile else None

    @property
    def location(self):
        return self.profile.location if self.profile else None

    @property
    def avatar(self):
        return self.profile.avatar if self.profile else None

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
    location = Column(String(100))
    avatar = Column(Text)

    student = relationship("Student", back_populates="profile")

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("students.id"))
    content = Column(Text)
    image = Column(Text)
    type = Column(String(50), default='general')
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    # Moderation
    is_approved = Column(Boolean, default=False)  # Posts are hidden until admin approves
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(String(100), nullable=True)  # Admin name snapshot

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

class PostLike(Base):
    __tablename__ = "post_likes"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    user_id = Column(Integer, ForeignKey("students.id"))
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("Student", back_populates="likes")

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
    attendees = Column(Integer, default=0) # Total count cache/denormalized

    attendees_relation = relationship("EventAttendee", back_populates="event")

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    type = Column(String(50))
    location = Column(String(255))
    apply_link = Column(String(255))
    posted_date = Column(DateTime, server_default=func.now())
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    posted_by = Column(String(50)) # Snapshot of user name who posted it

    applications = relationship("JobApplication", back_populates="job")

class MentorshipRequest(Base):
    __tablename__ = "mentorship_requests"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    mentor_id = Column(Integer, ForeignKey("students.id"))
    message = Column(Text)
    status = Column(String(50), default='Pending')  # Pending, Accepted, Rejected, Completed
    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, nullable=True)  # Auto-expire after a set period
    mentor_note = Column(Text, nullable=True)  # Mentor's response note on accept/reject

    student = relationship("Student", foreign_keys=[student_id], back_populates="mentorship_requests_sent")
    mentor = relationship("Student", foreign_keys=[mentor_id], back_populates="mentorship_requests_received")
    sessions = relationship("MentorshipSession", back_populates="request", cascade="all, delete-orphan")

class MentorshipSession(Base):
    """Tracks individual meetings/sessions between a mentor and mentee."""
    __tablename__ = "mentorship_sessions"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("mentorship_requests.id", ondelete="CASCADE"))
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    topic = Column(String(255))
    notes = Column(Text, nullable=True)  # Post-session notes from mentor
    status = Column(String(50), default='Scheduled')  # Scheduled, Completed, Cancelled
    created_at = Column(DateTime, server_default=func.now())

    request = relationship("MentorshipRequest", back_populates="sessions")

# New Tables found in mockData but missing in SQL
class JobApplication(Base):
    __tablename__ = "job_applications"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    status = Column(String(50), default='Applied')  # Applied, Shortlisted, Interviewing, Hired, Rejected
    applied_date = Column(DateTime, server_default=func.now())
    cover_letter = Column(Text, nullable=True)
    resume_url = Column(String(500), nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    job = relationship("Job", back_populates="applications")
    student = relationship("Student", back_populates="job_applications")
    status_history = relationship("JobApplicationStatusHistory", back_populates="application", cascade="all, delete-orphan")

class JobApplicationStatusHistory(Base):
    __tablename__ = "job_application_status_history"
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("job_applications.id", ondelete="CASCADE"))
    old_status = Column(String(50))
    new_status = Column(String(50))
    changed_at = Column(DateTime, server_default=func.now())
    note = Column(Text, nullable=True)

    application = relationship("JobApplication", back_populates="status_history")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("students.id"))
    text = Column(Text)
    read = Column(Boolean, default=False)
    type = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("Student", back_populates="notifications")

class EventAttendee(Base):
    __tablename__ = "event_attendees"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    status = Column(String(50), default='going') # going, interested, not_going
    created_at = Column(DateTime, server_default=func.now())

    event = relationship("Event", back_populates="attendees_relation")
    student = relationship("Student", back_populates="event_attendance")

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("students.id"))
    target_id = Column(Integer) # ID of post, comment, or user
    target_type = Column(String(50)) # 'Post', 'Comment', 'User'
    reason = Column(String(100))
    description = Column(Text)
    status = Column(String(50), default='Pending') # Pending, Resolved, Dismissed
    created_at = Column(DateTime, server_default=func.now())

    reporter = relationship("Student", back_populates="reports")
