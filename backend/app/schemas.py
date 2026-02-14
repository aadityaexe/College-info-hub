from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    id: int

class TokenData(BaseModel):
    email: str | None = None
    role: str | None = None

# User Schemas
class UserBase(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None
    role: Optional[str] = "Student"

class UserCreate(UserBase):
    password: str
    reg_no: Optional[str] = None
    course: Optional[str] = None
    batch: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    reg_no: Optional[str] = None
    course: Optional[str] = None
    batch: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    status: Optional[str] = "Pending"
    reg_no: Optional[str] = None
    course: Optional[str] = None
    batch: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None
    
    # For flattening profile fields from relationship if needed, or if we added columns to Student?
    # Wait, I added columns to StudentProfile, NOT Student table!
    # Pydantic orm_mode handles relationships object-to-object.
    # If User model maps to Student, and separate table StudentProfile has bio.
    # Student.profile.bio is where it lives.
    # Pydantic won't auto-flatten `profile.bio` to `bio` unless I verify how `orm_mode` handles 1-to-1 flattening or add properties.
    # Actually, in users.py I'm returning `user`. `user` is a Student object.
    # If I want `bio` in the JSON, I need a getter/property or nested schema.
    
    # Let's assume for now I should use a helper or specific Config. Or better:
    # Adding properties to the Student model in models.py to proxy these fields would be easiest for Pydantic.
    # OR update User schema to have `profile: Optional[StudentProfileSchemas]`
    
    # Given the frontend expects flat `bio`, `skills` etc in `user` object (based on EditProfileModal formData state intialization `user?.bio`),
    # flattening is preferred.
    
    class Config:
        orm_mode = True

# Student specific schemas
class StudentAcademicBase(BaseModel):
    enrollment_no: Optional[str] = None
    degree: Optional[str] = None
    specialization: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    # batch is already in User

class StudentAcademic(StudentAcademicBase):
    id: int
    student_id: int

    class Config:
        orm_mode = True

# Post Schemas
class CommentBase(BaseModel):
    text: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    user_id: int
    post_id: int
    created_at: datetime
    user: Optional[User] = None # For embedding user info

    class Config:
        orm_mode = True

class PostBase(BaseModel):
    content: str
    image: Optional[str] = None
    type: Optional[str] = "general"

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: int
    user_id: int
    likes_count: int
    created_at: datetime
    user: Optional[User] = None
    comments: List[Comment] = []

    class Config:
        orm_mode = True

# Event Schemas
class EventBase(BaseModel):
    title: str
    type: Optional[str] = None
    audience: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: int
    attendees: int
    user_rsvp: Optional[str] = None

    class Config:
        orm_mode = True

# Job Schemas
class JobBase(BaseModel):
    title: str
    company: str
    type: Optional[str] = None
    location: Optional[str] = None
    apply_link: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True

class JobCreate(JobBase):
    posted_by: Optional[str] = None

class Job(JobBase):
    id: int
    posted_date: datetime
    posted_by: Optional[str] = None

    class Config:
        orm_mode = True

# Mentorship Schemas
class MentorshipRequestBase(BaseModel):
    mentor_id: int
    message: str

class MentorshipRequestCreate(MentorshipRequestBase):
    pass

class MentorshipRequest(MentorshipRequestBase):
    id: int
    student_id: int
    status: str
    created_at: datetime
    student: Optional[User] = None
    mentor: Optional[User] = None

    class Config:
        orm_mode = True

# Common Response
class Message(BaseModel):
    message: str

# Notification Schemas
class NotificationBase(BaseModel):
    text: str
    type: Optional[str] = "info"
    read: bool = False

class NotificationCreate(NotificationBase):
    user_id: int

class Notification(NotificationBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class ReportBase(BaseModel):
    target_id: int
    target_type: str
    reason: str
    description: Optional[str] = None

class ReportCreate(ReportBase):
    pass

class Report(ReportBase):
    id: int
    reporter_id: int
    status: str
    created_at: datetime
    
    class Config:
        orm_mode = True
