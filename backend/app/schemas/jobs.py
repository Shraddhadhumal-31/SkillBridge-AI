from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SkillWeightItem(BaseModel):
    name: str
    weight: float
    importance: str

class LearningResourceItem(BaseModel):
    title: str
    type: str
    url: str
    provider: str
    estimated_hours: int

class JobProfileResponse(BaseModel):
    id: str
    title: str
    category: str
    experience_level: str
    description: str
    required_skills: List[SkillWeightItem]
    optional_skills: List[SkillWeightItem]
    learning_resources: List[LearningResourceItem]
    interview_topics: List[str]
    career_suitability_summary: str

class JobMatchRequest(BaseModel):
    skills: List[str]
    resume_text: Optional[str] = ""

class JobMatchItem(BaseModel):
    job_id: str
    job_title: str
    category: str
    description: str
    match_percentage: float
    required_coverage_percentage: float
    matched_required_skills: List[str]
    missing_required_skills: List[Dict[str, Any]]
    matched_optional_skills: List[str]
    missing_optional_skills: List[str]
    explanation: str
    career_suitability_summary: str
