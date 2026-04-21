import logging
import sys
import time
import json
from pythonjsonlogger import jsonlogger
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from . import models, database
from .routers import auth, users, posts, events, jobs, mentorship, notifications, admin, ws

# --- Structured Logging Setup ---
class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        if not log_record.get('timestamp'):
            now = time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime())
            log_record['timestamp'] = f"{now}Z"
        if log_record.get('level'):
            log_record['level'] = log_record['level'].upper()
        else:
            log_record['level'] = record.levelname

logger = logging.getLogger()
logHandler = logging.StreamHandler(sys.stdout)
formatter = CustomJsonFormatter('%(timestamp)s %(level)s %(name)s %(message)s')
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

# --- Rate Limiter Setup ---
limiter = Limiter(key_func=get_remote_address)

# Create all tables (normally use Alembic for migrations, but this is simpler for initial setup)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="College Info Hub API",
    description="Refined Premium Backend for College Information and Networking",
    version="2.0.0",
    debug=False # Production ready
)

# Rate Limiter Configuration
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- Middleware: Request Logging ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    
    log_dict = {
        "url": request.url.path,
        "method": request.method,
        "status_code": response.status_code,
        "process_time_ms": f"{process_time:.2f}ms"
    }
    logger.info("Request processed", extra=log_dict)
    return response

# --- Global Exception Handler ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled exception: {str(exc)}", 
        extra={"url": request.url.path, "method": request.method, "error": str(exc)},
        exc_info=True
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Our team has been notified."}
    )

# --- CORS Middleware ---
import os as _os

_raw_origins = _os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
)
origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Router Inclusions ---
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, tags=["Users"])
app.include_router(posts.router, tags=["Posts"])
app.include_router(events.router, tags=["Events"])
app.include_router(jobs.router, tags=["Jobs"])
app.include_router(mentorship.router, tags=["Mentorship"])
app.include_router(notifications.router, tags=["Notifications"])
app.include_router(admin.router, tags=["Admin"])
app.include_router(ws.router, tags=["WebSocket"])

@app.get("/", tags=["Health"])
def read_root():
    return {
        "status": "online",
        "message": "Welcome to College Info Hub API",
        "version": "2.0.0",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Lightweight health probe for load balancers and uptime monitors."""
    return {"status": "healthy", "version": "2.0.0"}
