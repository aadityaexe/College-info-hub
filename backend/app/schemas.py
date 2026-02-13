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

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    status: Optional[str] = "PENDING"
    reg_no: Optional[str] = None
    course: Optional[str] = None
    batch: Optional[str] = None

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
    description: Optional[str] = None
    is_active: bool = True

class JobCreate(JobBase):
    pass

class Job(JobBase):
    id: int
    posted_date: datetime

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
