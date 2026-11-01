from pydantic import BaseModel
from typing import Dict, List, Optional, Any

class ResumeUploadResponse(BaseModel):
    message: str
    file_id: str
    filename: str
    file_size: int
    char_count: int
    preview: str

class ResumeAnalysisResponse(BaseModel):
    id: str
    filename: str
    analysis_date: str
    char_count: int
    word_count: int
    preview_text: str
    contact_info: Dict[str, Optional[str]]
    sections: Dict[str, str]
    categorized_skills: Dict[str, List[str]]
    flat_skills: List[str]
    total_skills_count: int
    best_matching_role: Optional[str]
    best_match_score: Optional[float]
    recommended_jobs: List[Dict[str, Any]]

class ResumeHistoryItem(BaseModel):
    id: str
    filename: str
    analysis_date: str
    total_skills: int
    best_matching_role: Optional[str]
    best_match_score: Optional[float]
