from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class RoadmapGenerateRequest(BaseModel):
    target_role: str
    missing_skills: List[str]
    current_skills: Optional[List[str]] = []

class MilestoneItem(BaseModel):
    milestone_id: str
    week: int
    title: str
    objective: str
    skills: List[str]
    estimated_hours: int
    difficulty: str
    resources: List[Dict[str, Any]]
    action_items: List[str]
    completed: bool = False

class RoadmapResponse(BaseModel):
    id: Optional[str] = None
    target_role: str
    total_weeks: int
    total_estimated_hours: int
    total_milestones: int
    completed_milestones: int
    progress_percentage: float
    missing_skills_covered: List[str]
    milestones: List[MilestoneItem]

class MilestoneProgressUpdate(BaseModel):
    milestone_id: str
    completed: bool
