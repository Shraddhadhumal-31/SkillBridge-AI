from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SkillGapRequest(BaseModel):
    skills: List[str]
    job_id: str

class SkillGapResponse(BaseModel):
    job_id: str
    job_title: str
    category: str
    total_required_skills: int
    matched_required_count: int
    missing_required_count: int
    raw_coverage_percentage: float
    weighted_coverage_percentage: float
    compatibility_percentage: float
    matched_skills: List[Dict[str, Any]]
    missing_skills: List[Dict[str, Any]]
    partial_related_skills: List[Dict[str, Any]]
    matched_optional_skills: List[str]
    missing_optional_skills: List[str]
    recommendations: List[Dict[str, Any]]
    description: str
