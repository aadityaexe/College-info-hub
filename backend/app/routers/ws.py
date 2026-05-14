"""
WebSocket router — real-time notification delivery.
Each authenticated user connects once. When a server-side event
creates a Notification row, the same code path sends a live push.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from .. import models, database
from .users import get_current_user_from_token
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["WebSocket"])

# ── Connection Manager ───────────────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        # user_id -> WebSocket
        self.active: dict[int, WebSocket] = {}

    async def connect(self, user_id: int, ws: WebSocket):
        await ws.accept()
        self.active[user_id] = ws
        logger.info(f"WS connected user={user_id}")

    def disconnect(self, user_id: int):
        self.active.pop(user_id, None)
        logger.info(f"WS disconnected user={user_id}")

    async def push(self, user_id: int, payload: dict):
        """Send a JSON payload to a specific user if they are online."""
        ws = self.active.get(user_id)
        if ws:
            try:
                await ws.send_text(json.dumps(payload))
            except Exception:
                self.disconnect(user_id)


manager = ConnectionManager()


# ── Helper used by other routers ─────────────────────────────────────────────

async def notify_user_live(user_id: int, text: str, notif_type: str = "info", db: Session = None):
    """Create a DB notification record AND push a live WS event."""
    if db:
        notif = models.Notification(user_id=user_id, text=text, type=notif_type)
        db.add(notif)
        db.commit()
        db.refresh(notif)
        payload = {
            "id": notif.id,
            "text": notif.text,
            "type": notif.type,
            "read": notif.read,
        }
    else:
        payload = {"text": text, "type": notif_type}
    await manager.push(user_id, payload)


# ── WebSocket Endpoint ────────────────────────────────────────────────────────

@router.websocket("/ws/notifications")
async def websocket_endpoint(websocket: WebSocket):
    """
    Client connects with: ws://localhost:8000/ws/notifications?token=<jwt>
    """
    # --- Auth via query param ---
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001)
        return

    # Resolve user from token manually (no Depends on WS)
    from .users import SECRET_KEY, ALGORITHM
    try:
        from jose import jwt, JWTError
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role", "")
    except Exception:
        await websocket.close(code=4001)
        return

    db: Session = database.SessionLocal()
    try:
        if role == "admin":
            user = db.query(models.Admin).filter(models.Admin.email == email).first()
        else:
            user = db.query(models.Student).filter(models.Student.email == email).first()
    finally:
        db.close()

    if not user:
        await websocket.close(code=4001)
        return

    await manager.connect(user.id, websocket)
    try:
        # Keep socket alive; client can ping/pong
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user.id)
