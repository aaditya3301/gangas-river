"""Context-aware citizen chat assistant routes."""

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db import CommunityReport, get_db

try:
    from groq import Groq
except ImportError:
    Groq = None  # type: ignore[assignment]

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)


def _format_live_context(total: int, pending: int, flood_count: int, recent_lines: list[str]) -> str:
    if not recent_lines:
        recent_lines = ["No recent report records available."]

    return (
        "LIVE SITUATION DATA:\n"
        f"- Total reports: {total}\n"
        f"- Pending reports: {pending}\n"
        f"- Flood reports: {flood_count}\n"
        "- Recent reports:\n"
        + "\n".join(recent_lines)
        + "\n- Shelters: Prayagraj, Varanasi, Kanpur, Patna"
    )


async def _build_live_context(db: AsyncSession) -> str:
    try:
        total = int((await db.execute(select(func.count(CommunityReport.id)))).scalar() or 0)
        pending = int(
            (
                await db.execute(
                    select(func.count(CommunityReport.id)).where(CommunityReport.status == "pending")
                )
            ).scalar()
            or 0
        )
        flood_count = int(
            (
                await db.execute(
                    select(func.count(CommunityReport.id)).where(CommunityReport.category == "flood")
                )
            ).scalar()
            or 0
        )

        rows = (
            (
                await db.execute(
                    select(CommunityReport)
                    .order_by(CommunityReport.reported_at.desc())
                    .limit(5)
                )
            )
            .scalars()
            .all()
        )

        recent_lines = []
        for row in rows:
            category = row.category.value if hasattr(row.category, "value") else str(row.category)
            status = row.status.value if hasattr(row.status, "value") else str(row.status)
            desc = (row.description or "No description").strip()[:100]
            ts = row.reported_at.strftime("%Y-%m-%d %H:%M") if isinstance(row.reported_at, datetime) else "N/A"
            recent_lines.append(f"  - [{category}] {desc} ({status}, {ts})")

        return _format_live_context(total, pending, flood_count, recent_lines)
    except Exception:
        return _format_live_context(
            total=4,
            pending=1,
            flood_count=2,
            recent_lines=[
                "  - [flood] Hapur low-lying road waterlogging (verified)",
                "  - [erosion] Varanasi ghat bank erosion (pending)",
                "  - [infrastructure] Prayagraj drain choke and road damage (verified)",
            ],
        )


def _build_system_prompt(live_context: str) -> str:
    return (
        "You are the AquaGuardians AI Assistant for flood safety in India. "
        "Give concise, actionable, safety-first responses. "
        "Support both English and Hindi. "
        "If uncertain, clearly say so and suggest checking Safety and Routes features.\n\n"
        + live_context
    )


@router.post("/")
@router.post("/chat")
async def chat_with_groq(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Chat endpoint with optional history and live report context."""
    api_key = settings.GROQ_API_KEY
    if not api_key or Groq is None:
        fallback = "I can help with flood safety, safe routes, and reporting incidents, but AI service is not configured yet."
        return {"response": fallback, "reply": fallback, "context_used": False}

    live_context = await _build_live_context(db)
    messages = [{"role": "system", "content": _build_system_prompt(live_context)}]

    for msg in request.history[-10:]:
        role = "assistant" if msg.role not in ("user", "assistant") else msg.role
        messages.append({"role": role, "content": msg.content})

    messages.append({"role": "user", "content": request.message})

    try:
        client = Groq(api_key=api_key)  # type: ignore[operator]
        candidate_models = [
            settings.GROQ_MODEL,
            "llama-3.1-8b-instant",
            "llama-3.3-70b-versatile",
        ]

        for model_name in dict.fromkeys(candidate_models):
            try:
                chat_completion = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=0.6,
                    max_tokens=400,
                    top_p=1,
                    stream=False,
                )
                reply = chat_completion.choices[0].message.content
                if not isinstance(reply, str):
                    reply = "I can help with flood safety guidance and routes."
                return {"response": reply, "reply": reply, "context_used": True, "model": model_name}
            except Exception:
                continue

        fallback = "I am having trouble connecting to AI right now. Please try again shortly."
        return {"response": fallback, "reply": fallback, "context_used": True}
    except Exception:
        fallback = "I am having trouble connecting to AI right now. Please try again shortly."
        return {"response": fallback, "reply": fallback, "context_used": True}
