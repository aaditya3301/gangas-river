"""NGO task workflow endpoints for creation, progress, verification, and leaderboard."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from geoalchemy2.functions import ST_MakePoint, ST_SetSRID, ST_X, ST_Y
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import TokenData, get_current_user
from app.db import NGOTask, User, get_db

router = APIRouter()


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=10)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    task_type: str = Field(..., pattern="^(cleanup|relief|survey|monitoring)$")


class TaskComplete(BaseModel):
    proof_photo_url: str = Field(..., min_length=5, max_length=500)


class TaskVerify(BaseModel):
    verification_score: float = Field(..., ge=0, le=1)
    points_awarded: int = Field(..., ge=0, le=100)


class ActivityReport(BaseModel):
    """NGO activity form payload for officials NGO portal."""
    ngo_name: str = Field(..., min_length=2, max_length=255)
    contact_person: str = Field(..., min_length=2, max_length=255)
    location: str = Field(..., min_length=2, max_length=500)
    people_helped: int = Field(..., ge=0)
    resources_provided: str = Field(default="", max_length=1000)
    activity_description: str = Field(..., min_length=10, max_length=5000)
    latitude: Optional[float] = None
    longitude: Optional[float] = None


def _pack_description(task_type: str, description: str) -> str:
    return f"[{task_type}] {description}"


def _unpack_description(raw_text: str | None) -> tuple[str, str]:
    if not raw_text:
        return "cleanup", ""
    if raw_text.startswith("[") and "] " in raw_text:
        maybe_type, plain_text = raw_text[1:].split("] ", 1)
        if maybe_type in {"cleanup", "relief", "survey", "monitoring"}:
            return maybe_type, plain_text
    return "cleanup", raw_text


async def _task_row_to_dict(row: object, db: AsyncSession) -> dict:
    task = row.NGOTask
    task_type, description = _unpack_description(task.description)

    ngo_name = row.ngo_name
    if ngo_name is None:
        result = await db.execute(select(User.full_name).where(User.id == task.ngo_user_id))
        ngo_name = result.scalar_one_or_none()

    return {
        "id": task.id,
        "ngo_user_id": task.ngo_user_id,
        "ngo_name": ngo_name or "Unknown NGO",
        "title": task.title,
        "description": description,
        "task_type": task_type,
        "status": task.status,
        "proof_photo_url": task.proof_photo_url,
        "verification_score": float(task.satellite_verification_score or 0),
        "points_awarded": int(task.points_awarded or 0),
        "latitude": float(row.latitude) if row.latitude is not None else None,
        "longitude": float(row.longitude) if row.longitude is not None else None,
        "created_at": task.created_at.isoformat() if task.created_at else None,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
    }


async def _get_task(task_id: int, db: AsyncSession) -> NGOTask:
    result = await db.execute(select(NGOTask).where(NGOTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/activity-report")
async def submit_activity_report(
    report: ActivityReport,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """Submit NGO activity report; creates an auto-completed task for verification."""
    lat = report.latitude if report.latitude is not None else 0.0
    lng = report.longitude if report.longitude is not None else 0.0

    task = NGOTask(
        ngo_user_id=current_user.user_id,
        title=f"Activity: {report.ngo_name} at {report.location}",
        description=(
            f"Contact: {report.contact_person}\n"
            f"People helped: {report.people_helped}\n"
            f"Resources: {report.resources_provided}\n\n"
            f"{report.activity_description}"
        ),
        location=ST_SetSRID(ST_MakePoint(lng, lat), 4326),
        status="completed",
        completed_at=datetime.utcnow(),
    )
    db.add(task)
    await db.flush()
    await db.refresh(task)

    return {
        "task_id": task.id,
        "status": "submitted",
        "message": "Activity report submitted. Pending official verification.",
    }


@router.post("/tasks")
async def create_task(
    task: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """Create a new NGO task for the logged-in NGO user."""
    db_task = NGOTask(
        ngo_user_id=current_user.user_id,
        title=task.title,
        description=_pack_description(task.task_type, task.description),
        location=ST_SetSRID(ST_MakePoint(task.longitude, task.latitude), 4326),
        status="pending",
    )
    db.add(db_task)
    await db.flush()
    await db.refresh(db_task)

    return {
        "id": db_task.id,
        "status": db_task.status,
        "message": "Task created",
    }


@router.get("/tasks")
async def get_all_tasks(
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Get all tasks, optionally filtered by status."""
    query = (
        select(
            NGOTask,
            ST_Y(NGOTask.location).label("latitude"),
            ST_X(NGOTask.location).label("longitude"),
            User.full_name.label("ngo_name"),
        )
        .join(User, User.id == NGOTask.ngo_user_id, isouter=True)
        .order_by(NGOTask.created_at.desc())
    )

    if status:
        query = query.where(NGOTask.status == status)

    result = await db.execute(query)
    rows = result.all()
    return [await _task_row_to_dict(row, db) for row in rows]


@router.get("/my-tasks")
async def get_my_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """Get tasks created by the current NGO user."""
    result = await db.execute(
        select(
            NGOTask,
            ST_Y(NGOTask.location).label("latitude"),
            ST_X(NGOTask.location).label("longitude"),
            User.full_name.label("ngo_name"),
        )
        .join(User, User.id == NGOTask.ngo_user_id, isouter=True)
        .where(NGOTask.ngo_user_id == current_user.user_id)
        .order_by(NGOTask.created_at.desc())
    )

    rows = result.all()
    return [await _task_row_to_dict(row, db) for row in rows]


@router.patch("/tasks/{task_id}/start")
async def start_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """Mark task as in-progress by task owner."""
    task = await _get_task(task_id, db)
    if task.ngo_user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not your task")

    task.status = "in_progress"
    await db.flush()
    return {"status": "in_progress"}


@router.patch("/tasks/{task_id}/complete")
async def complete_task(
    task_id: int,
    data: TaskComplete,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """Submit task completion with proof URL by task owner."""
    task = await _get_task(task_id, db)
    if task.ngo_user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not your task")

    task.status = "completed"
    task.proof_photo_url = data.proof_photo_url
    task.completed_at = datetime.utcnow()
    await db.flush()
    return {"status": "completed"}


@router.patch("/tasks/{task_id}/verify")
async def verify_task(
    task_id: int,
    data: TaskVerify,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """Verify task completion and award points. Officials/Admin only."""
    if current_user.role not in ("official", "admin"):
        raise HTTPException(status_code=403, detail="Officials only")

    task = await _get_task(task_id, db)
    if task.status != "completed":
        raise HTTPException(status_code=400, detail="Task must be completed first")

    task.status = "verified"
    task.satellite_verification_score = data.verification_score
    task.points_awarded = data.points_awarded
    await db.flush()

    return {"status": "verified", "points_awarded": data.points_awarded}


@router.get("/leaderboard")
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    """Leaderboard of NGOs based on verified task points."""
    result = await db.execute(
        select(
            NGOTask.ngo_user_id,
            func.sum(NGOTask.points_awarded).label("total_points"),
            func.count(NGOTask.id).label("task_count"),
        )
        .where(NGOTask.status == "verified")
        .group_by(NGOTask.ngo_user_id)
        .order_by(func.sum(NGOTask.points_awarded).desc())
        .limit(20)
    )

    rows = result.fetchall()
    leaderboard = []
    for row in rows:
        user_result = await db.execute(select(User.full_name).where(User.id == row.ngo_user_id))
        name = user_result.scalar_one_or_none() or "Unknown NGO"
        leaderboard.append(
            {
                "user_id": int(row.ngo_user_id),
                "name": name,
                "total_points": int(row.total_points or 0),
                "tasks_completed": int(row.task_count or 0),
            }
        )

    return leaderboard


@router.get("/leaderboard-detailed")
async def detailed_leaderboard(db: AsyncSession = Depends(get_db)):
    """Leaderboard with points, task count, and last active timestamp."""
    result = await db.execute(
        select(
            NGOTask.ngo_user_id,
            func.sum(NGOTask.points_awarded).label("points"),
            func.count(NGOTask.id).label("tasks"),
            func.max(NGOTask.completed_at).label("last_active"),
        )
        .where(NGOTask.status.in_(["completed", "verified"]))
        .group_by(NGOTask.ngo_user_id)
        .order_by(func.sum(NGOTask.points_awarded).desc())
        .limit(20)
    )

    rows = result.fetchall()
    leaderboard = []
    for row in rows:
        user_res = await db.execute(select(User.full_name).where(User.id == row.ngo_user_id))
        leaderboard.append(
            {
                "user_id": int(row.ngo_user_id),
                "name": user_res.scalar_one_or_none() or "Unknown NGO",
                "points": int(row.points or 0),
                "tasks": int(row.tasks or 0),
                "last_active": row.last_active.isoformat() if row.last_active else None,
            }
        )

    return {"leaderboard": leaderboard}
