from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .routers import auth, users, posts, events, jobs, mentorship, notifications, admin

# Create all tables (normally use Alembic for migrations, but this is simpler for initial setup)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(debug=True)

# CORS Middleware
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(events.router)
app.include_router(jobs.router)
app.include_router(mentorship.router)
app.include_router(notifications.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to College Info Hub API"}
