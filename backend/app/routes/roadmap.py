import uuid
import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional
from app.ml.roadmap_generator import RoadmapGenerator
from app.database import career_roadmaps_col
from app.utils.auth_deps import get_optional_user, get_current_user
from app.schemas.roadmap import RoadmapGenerateRequest, MilestoneProgressUpdate, RoadmapResponse

router = APIRouter(prefix="/roadmap", tags=["Career Roadmap"])

roadmap_generator = RoadmapGenerator()

@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(
    payload: RoadmapGenerateRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Constructs a personalized, weekly milestone learning curriculum
    using the user's missing skills, target role, and curated educational resources.
    Saves in MongoDB for persistent tracking.
    """
    roadmap_data = roadmap_generator.generate_roadmap(
        target_role=payload.target_role,
        missing_skills=payload.missing_skills,
        current_skills=payload.current_skills
    )

    roadmap_id = str(uuid.uuid4())
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    user_id = current_user["_id"] if current_user else "anonymous"

    record = {
        "_id": roadmap_id,
        "user_id": user_id,
        "target_role": roadmap_data["target_role"],
        "total_weeks": roadmap_data["total_weeks"],
        "total_estimated_hours": roadmap_data["total_estimated_hours"],
        "total_milestones": roadmap_data["total_milestones"],
        "completed_milestones": roadmap_data["completed_milestones"],
        "progress_percentage": roadmap_data["progress_percentage"],
        "missing_skills_covered": roadmap_data["missing_skills_covered"],
        "milestones": roadmap_data["milestones"],
        "updated_at": now,
        "created_at": now
    }

    career_roadmaps_col.insert_one(record)
    record["id"] = roadmap_id
    return RoadmapResponse(**record)

@router.get("", response_model=RoadmapResponse)
async def get_active_roadmap(current_user: dict = Depends(get_current_user)):
    """Fetch the current active roadmap for the authenticated user."""
    roadmap = career_roadmaps_col.find_one({"user_id": current_user["_id"]})
    if not roadmap:
        # If no custom roadmap exists, generate a default one for Python Developer
        default_data = roadmap_generator.generate_roadmap("Python Developer", ["FastAPI", "PostgreSQL", "PyTest"])
        roadmap_id = str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        record = {
            "_id": roadmap_id,
            "user_id": current_user["_id"],
            "target_role": default_data["target_role"],
            "total_weeks": default_data["total_weeks"],
            "total_estimated_hours": default_data["total_estimated_hours"],
            "total_milestones": default_data["total_milestones"],
            "completed_milestones": default_data["completed_milestones"],
            "progress_percentage": default_data["progress_percentage"],
            "missing_skills_covered": default_data["missing_skills_covered"],
            "milestones": default_data["milestones"],
            "updated_at": now,
            "created_at": now
        }
        career_roadmaps_col.insert_one(record)
        record["id"] = roadmap_id
        return RoadmapResponse(**record)

    roadmap["id"] = roadmap["_id"]
    return RoadmapResponse(**roadmap)

@router.put("/{roadmap_id}/progress", response_model=RoadmapResponse)
async def update_milestone_progress(
    roadmap_id: str,
    update: MilestoneProgressUpdate,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Marks a milestone as completed or pending and updates progress percentage."""
    roadmap = career_roadmaps_col.find_one({"_id": roadmap_id})
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found.")

    milestones = roadmap.get("milestones", [])
    matched = False
    for m in milestones:
        if m.get("milestone_id") == update.milestone_id:
            m["completed"] = update.completed
            matched = True
            break

    if not matched:
        raise HTTPException(status_code=404, detail=f"Milestone '{update.milestone_id}' not found in roadmap.")

    completed_count = sum(1 for m in milestones if m.get("completed", False))
    progress_percentage = round((completed_count / len(milestones) * 100) if milestones else 0.0, 1)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    career_roadmaps_col.update_one(
        {"_id": roadmap_id},
        {"$set": {
            "milestones": milestones,
            "completed_milestones": completed_count,
            "progress_percentage": progress_percentage,
            "updated_at": now
        }}
    )

    roadmap["milestones"] = milestones
    roadmap["completed_milestones"] = completed_count
    roadmap["progress_percentage"] = progress_percentage
    roadmap["id"] = roadmap["_id"]

    return RoadmapResponse(**roadmap)
