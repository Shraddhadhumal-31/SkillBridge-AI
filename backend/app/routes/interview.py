import uuid
import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional, List, Dict, Any
from app.ml.interview_generator import InterviewGenerator
from app.database import interview_sessions_col
from app.utils.auth_deps import get_optional_user, get_current_user
from app.schemas.interview import (
    InterviewGenerateRequest,
    InterviewSessionResponse,
    MockTestSubmitRequest,
    MockTestResultResponse
)

router = APIRouter(prefix="/interview", tags=["AI Interview Preparation"])

interview_generator = InterviewGenerator()

@router.post("/generate", response_model=InterviewSessionResponse)
async def generate_interview(
    payload: InterviewGenerateRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Generates a technical interview mock test tailored to the chosen role and skill gaps.
    Prioritizes questions from missing skills so candidates can target their learning areas.
    """
    session = interview_generator.generate_interview(
        role_identifier=payload.role_id,
        missing_skills=payload.missing_skills,
        possessed_skills=payload.possessed_skills,
        num_questions=payload.num_questions or 5,
        difficulty=payload.difficulty or "All"
    )
    return InterviewSessionResponse(**session)

@router.post("/submit", response_model=MockTestResultResponse)
async def submit_mock_test(
    payload: MockTestSubmitRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Evaluates candidate's submitted answers.
    Calculates score percentage, provides technical explanations for each question,
    and stores the session result.
    """
    answers_dicts = [a.model_dump() for a in payload.answers]
    evaluation = interview_generator.evaluate_submission(payload.role_id, answers_dicts)

    session_id = payload.session_id or f"mock_{uuid.uuid4()}"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    user_id = current_user["_id"] if current_user else "anonymous"

    session_record = {
        "_id": session_id,
        "user_id": user_id,
        "role_id": payload.role_id,
        "submitted_at": now,
        "total_questions": evaluation["total_questions"],
        "correct_count": evaluation["correct_count"],
        "incorrect_count": evaluation["incorrect_count"],
        "score_percentage": evaluation["score_percentage"],
        "rating": evaluation["rating"],
        "summary": evaluation["summary"],
        "breakdown": evaluation["breakdown"]
    }

    interview_sessions_col.insert_one(session_record)

    return MockTestResultResponse(
        session_id=session_id,
        role_id=payload.role_id,
        total_questions=evaluation["total_questions"],
        correct_count=evaluation["correct_count"],
        incorrect_count=evaluation["incorrect_count"],
        score_percentage=evaluation["score_percentage"],
        rating=evaluation["rating"],
        summary=evaluation["summary"],
        breakdown=evaluation["breakdown"]
    )

@router.get("/history", response_model=List[Dict[str, Any]])
async def get_interview_history(current_user: dict = Depends(get_current_user)):
    """Retrieve past mock test results for current user."""
    records = interview_sessions_col.find({"user_id": current_user["_id"]}).sort("submitted_at", -1)
    history = []
    for r in records:
        history.append({
            "session_id": r["_id"],
            "role_id": r.get("role_id", "General"),
            "submitted_at": r.get("submitted_at", ""),
            "total_questions": r.get("total_questions", 0),
            "correct_count": r.get("correct_count", 0),
            "score_percentage": r.get("score_percentage", 0.0),
            "rating": r.get("rating", "N/A"),
            "summary": r.get("summary", "")
        })
    return history
