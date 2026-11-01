from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from app.ml.job_matcher import JobMatcher
from app.schemas.jobs import JobProfileResponse, JobMatchRequest, JobMatchItem

router = APIRouter(prefix="/jobs", tags=["Job Profiles & Matching"])

job_matcher = JobMatcher()

@router.get("", response_model=List[JobProfileResponse])
async def list_jobs():
    """Retrieve all structured industry job profiles."""
    profiles = job_matcher.job_profiles
    results = []
    for p in profiles:
        results.append(JobProfileResponse(
            id=p.get("id"),
            title=p.get("title"),
            category=p.get("category"),
            experience_level=p.get("experience_level", "Entry to Mid Level"),
            description=p.get("description"),
            required_skills=p.get("required_skills", []),
            optional_skills=p.get("optional_skills", []),
            learning_resources=p.get("learning_resources", []),
            interview_topics=p.get("interview_topics", []),
            career_suitability_summary=p.get("career_suitability_summary", "")
        ))
    return results

@router.post("/match", response_model=List[JobMatchItem])
async def match_jobs(payload: JobMatchRequest):
    """Dynamically calculates compatibility rankings for a given skill list and resume text."""
    if not payload.skills:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skills list cannot be empty."
        )
    matches = job_matcher.match_jobs(payload.skills, payload.resume_text or "")
    results = []
    for m in matches:
        results.append(JobMatchItem(
            job_id=m["job_id"],
            job_title=m["job_title"],
            category=m["category"],
            description=m["description"],
            match_percentage=m["match_percentage"],
            required_coverage_percentage=m["required_coverage_percentage"],
            matched_required_skills=m["matched_required_skills"],
            missing_required_skills=m["missing_required_skills"],
            matched_optional_skills=m["matched_optional_skills"],
            missing_optional_skills=m["missing_optional_skills"],
            explanation=m["explanation"],
            career_suitability_summary=m["career_suitability_summary"]
        ))
    return results

@router.get("/{job_id}", response_model=JobProfileResponse)
async def get_job(job_id: str):
    """Retrieve detailed specification for a specific job role."""
    job = job_matcher.get_job_by_id(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job role with ID or title '{job_id}' not found."
        )
    return JobProfileResponse(
        id=job.get("id"),
        title=job.get("title"),
        category=job.get("category"),
        experience_level=job.get("experience_level", "Entry to Mid Level"),
        description=job.get("description"),
        required_skills=job.get("required_skills", []),
        optional_skills=job.get("optional_skills", []),
        learning_resources=job.get("learning_resources", []),
        interview_topics=job.get("interview_topics", []),
        career_suitability_summary=job.get("career_suitability_summary", "")
    )
