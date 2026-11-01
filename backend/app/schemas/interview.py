from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class InterviewGenerateRequest(BaseModel):
    role_id: str
    missing_skills: Optional[List[str]] = []
    possessed_skills: Optional[List[str]] = []
    num_questions: Optional[int] = 5
    difficulty: Optional[str] = "All"

class QuestionItem(BaseModel):
    question_id: str
    question_index: int
    skill: str
    difficulty: str
    question: str
    options: List[str]

class InterviewSessionResponse(BaseModel):
    session_id: str
    role_title: str
    role_id: Optional[str]
    difficulty: str
    total_questions: int
    questions: List[QuestionItem]

class AnswerSubmissionItem(BaseModel):
    question_id: str
    selected_index: int

class MockTestSubmitRequest(BaseModel):
    session_id: Optional[str] = None
    role_id: str
    answers: List[AnswerSubmissionItem]

class MockTestResultResponse(BaseModel):
    session_id: Optional[str] = None
    role_id: str
    total_questions: int
    correct_count: int
    incorrect_count: int
    score_percentage: float
    rating: str
    summary: str
    breakdown: List[Dict[str, Any]]
