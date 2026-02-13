from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .routers import auth, users, posts, events, jobs, mentorship

# Create all tables (normally use Alembic for migrations, but this is simpler for initial setup)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(debug=True)

# CORS Middleware removed as requested

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(events.router)
app.include_router(jobs.router)
app.include_router(mentorship.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to College Info Hub API"}
