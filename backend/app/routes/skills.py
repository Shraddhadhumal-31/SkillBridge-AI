from fastapi import APIRouter, HTTPException, status
from app.ml.skill_gap_analyzer import SkillGapAnalyzer
from app.schemas.skills import SkillGapRequest, SkillGapResponse

router = APIRouter(prefix="/skills", tags=["Skill Gap Analysis"])

skill_gap_analyzer = SkillGapAnalyzer()

@router.post("/analyze", response_model=SkillGapResponse)
async def analyze_skill_gap(payload: SkillGapRequest):
    """
    Compares candidate skills with target job requirements.
    Detects matched, missing, and related transferable skills,
    calculates coverage percentages, and provides targeted recommendations.
    """
    if not payload.job_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job ID or title must be specified."
        )

    try:
        gap_results = skill_gap_analyzer.analyze_gap(payload.skills, payload.job_id)
        return SkillGapResponse(**gap_results)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
