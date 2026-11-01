from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any, List
from app.database import users_col, resume_analyses_col, career_roadmaps_col, interview_sessions_col
from app.utils.auth_deps import get_current_user
from app.schemas.user import UserResponse, UserPreferencesUpdate

router = APIRouter(prefix="/user", tags=["User Profile & Dashboard"])

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Fetch current user profile."""
    return UserResponse(
        id=current_user["_id"],
        full_name=current_user["full_name"],
        email=current_user["email"],
        target_career_role=current_user.get("target_career_role"),
        learning_preferences=current_user.get("learning_preferences"),
        created_at=current_user.get("created_at")
    )

@router.put("/profile", response_model=UserResponse)
async def update_profile(payload: UserPreferencesUpdate, current_user: dict = Depends(get_current_user)):
    """Update user preferences or target career role."""
    updates = {}
    if payload.full_name is not None:
        updates["full_name"] = payload.full_name.strip()
    if payload.target_career_role is not None:
        updates["target_career_role"] = payload.target_career_role.strip()
    if payload.learning_preferences is not None:
        updates["learning_preferences"] = payload.learning_preferences.strip()

    if updates:
        users_col.update_one({"_id": current_user["_id"]}, {"$set": updates})
        current_user.update(updates)

    return UserResponse(
        id=current_user["_id"],
        full_name=current_user["full_name"],
        email=current_user["email"],
        target_career_role=current_user.get("target_career_role"),
        learning_preferences=current_user.get("learning_preferences"),
        created_at=current_user.get("created_at")
    )

@router.get("/dashboard")
async def get_dashboard_data(current_user: dict = Depends(get_current_user)):
    """
    Returns aggregated metrics for the user dashboard:
    - Total analyses
    - Total extracted skills
    - Best matching role & score
    - Average match score
    - Recent analyses
    - Active roadmap progress
    - Interview stats
    """
    user_id = current_user["_id"]
    analyses = list(resume_analyses_col.find({"user_id": user_id}).sort("analysis_date", -1))
    
    total_analyses = len(analyses)
    total_skills_extracted = sum(a.get("total_skills_count", 0) for a in analyses)
    
    best_matching_role = "None yet"
    best_match_score = 0.0
    avg_match_percentage = 0.0
    
    if analyses:
        latest = analyses[0]
        best_matching_role = latest.get("best_matching_role") or "Full Stack Developer"
        best_match_score = latest.get("best_match_score") or 0.0
        scores = [a.get("best_match_score", 0.0) for a in analyses if a.get("best_match_score") is not None]
        if scores:
            avg_match_percentage = round(sum(scores) / len(scores), 1)

    # Fetch active roadmap
    roadmap = career_roadmaps_col.find_one({"user_id": user_id})
    roadmap_progress = 0.0
    completed_milestones = 0
    total_milestones = 0
    target_role = current_user.get("target_career_role") or (best_matching_role if best_matching_role != "None yet" else "Software Engineer")
    
    if roadmap:
        roadmap_progress = roadmap.get("progress_percentage", 0.0)
        completed_milestones = roadmap.get("completed_milestones", 0)
        total_milestones = roadmap.get("total_milestones", 0)
        if roadmap.get("target_role"):
            target_role = roadmap.get("target_role")

    # Recent analyses summary
    recent_analyses = []
    for a in analyses[:5]:
        recent_analyses.append({
            "id": a["_id"],
            "filename": a.get("filename", "Resume"),
            "date": a.get("analysis_date", ""),
            "skills_count": a.get("total_skills_count", 0),
            "best_role": a.get("best_matching_role", "N/A"),
            "match_score": a.get("best_match_score", 0.0)
        })

    # Recommended career roles from latest analysis
    recommended_roles = []
    skill_category_distribution = []
    if analyses:
        latest_recs = analyses[0].get("recommended_jobs", [])
        for r in latest_recs[:4]:
            recommended_roles.append({
                "job_title": r.get("job_title"),
                "category": r.get("category"),
                "match_percentage": r.get("match_percentage"),
                "matched_count": len(r.get("matched_required_skills", [])),
                "missing_count": len(r.get("missing_required_skills", []))
            })
        
        # Skill category breakdown for Recharts
        cat_skills = analyses[0].get("categorized_skills", {})
        for cat_key, s_list in cat_skills.items():
            display_name = cat_key.replace("_", " ").title()
            skill_category_distribution.append({
                "category": display_name,
                "count": len(s_list)
            })

    return {
        "user_name": current_user["full_name"],
        "target_role": target_role,
        "total_analyses": total_analyses,
        "total_skills_extracted": total_skills_extracted,
        "best_matching_role": best_matching_role,
        "best_match_score": best_match_score,
        "avg_match_percentage": avg_match_percentage,
        "roadmap_progress": roadmap_progress,
        "completed_milestones": completed_milestones,
        "total_milestones": total_milestones,
        "recent_analyses": recent_analyses,
        "recommended_roles": recommended_roles,
        "skill_category_distribution": skill_category_distribution
    }
