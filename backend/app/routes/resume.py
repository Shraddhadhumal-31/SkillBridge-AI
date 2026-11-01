import os
import uuid
import tempfile
import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from typing import Optional, List
from app.ml.resume_parser import ResumeParser
from app.ml.skill_extractor import SkillExtractor
from app.ml.job_matcher import JobMatcher
from app.database import resume_analyses_col
from app.utils.auth_deps import get_optional_user, get_current_user
from app.schemas.resume import ResumeAnalysisResponse, ResumeHistoryItem, ResumeUploadResponse

router = APIRouter(prefix="/resume", tags=["Resume Processing"])

# Initialize ML services
skill_extractor = SkillExtractor()
job_matcher = JobMatcher()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    """Validates and extracts preview text from uploaded PDF or DOCX resume."""
    filename = file.filename or "resume.pdf"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Please upload a valid PDF or DOCX file."
        )

    # Save to temporary file securely
    temp_fd, temp_path = tempfile.mkstemp(suffix=ext)
    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded resume file is empty (0 bytes)."
            )
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds the 10MB limit. Please upload a smaller document."
            )

        with os.fdopen(temp_fd, "wb") as f:
            f.write(content)

        parsed_data = ResumeParser.parse(temp_path)
        file_id = str(uuid.uuid4())

        return ResumeUploadResponse(
            message="Resume parsed successfully.",
            file_id=file_id,
            filename=filename,
            file_size=len(content),
            char_count=parsed_data["char_count"],
            preview=parsed_data["preview"]
        )
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

@router.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Core AI Pipeline:
    1. Extracts text from PDF/DOCX or accepts raw text.
    2. Identifies and categorizes technical skills using NLP.
    3. Matches skills and text against industry job profiles using TF-IDF and Cosine Similarity.
    4. Persists the analysis history for the user.
    """
    extracted_text = ""
    filename = "Pasted Resume Text"
    char_count = 0
    contact_info = {"email": None, "phone": None, "linkedin": None, "github": None}
    sections = {"education": "", "experience": "", "projects": "", "summary": ""}

    if file:
        filename = file.filename or "resume.pdf"
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type '{ext}'. Allowed: .pdf, .docx"
            )

        temp_fd, temp_path = tempfile.mkstemp(suffix=ext)
        try:
            content = await file.read()
            if len(content) == 0:
                raise HTTPException(status_code=400, detail="The uploaded resume file is empty.")
            if len(content) > MAX_FILE_SIZE_BYTES:
                raise HTTPException(status_code=400, detail="File size exceeds the 10MB limit.")

            with os.fdopen(temp_fd, "wb") as f:
                f.write(content)

            parsed = ResumeParser.parse(temp_path)
            extracted_text = parsed["raw_text"]
            char_count = parsed["char_count"]
            contact_info = parsed["contact_info"]
            sections = parsed["sections"]
        finally:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass
    elif raw_text and raw_text.strip():
        extracted_text = ResumeParser.clean_text(raw_text)
        char_count = len(extracted_text)
        contact_info = ResumeParser.extract_contact_info(extracted_text)
        sections = ResumeParser.extract_sections(extracted_text)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a resume file (.pdf, .docx) or paste resume text."
        )

    # Step 2: NLP Skill Extraction
    skill_results = skill_extractor.extract_skills(extracted_text)
    flat_skills = skill_results["flat_skills"]
    categorized_skills = skill_results["categorized"]

    # Step 3: Job Matching Engine (TF-IDF + Cosine Similarity + Weighted Overlap)
    job_recommendations = job_matcher.match_jobs(flat_skills, extracted_text)

    best_role = job_recommendations[0]["job_title"] if job_recommendations else None
    best_score = job_recommendations[0]["match_percentage"] if job_recommendations else 0.0

    analysis_id = str(uuid.uuid4())
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    user_id = current_user["_id"] if current_user else "anonymous"

    analysis_record = {
        "_id": analysis_id,
        "user_id": user_id,
        "filename": filename,
        "analysis_date": now,
        "char_count": char_count,
        "word_count": len(extracted_text.split()),
        "preview_text": extracted_text[:350] + ("..." if len(extracted_text) > 350 else ""),
        "contact_info": contact_info,
        "sections": sections,
        "categorized_skills": categorized_skills,
        "flat_skills": flat_skills,
        "total_skills_count": len(flat_skills),
        "best_matching_role": best_role,
        "best_match_score": best_score,
        "recommended_jobs": job_recommendations
    }

    # Persist in database
    resume_analyses_col.insert_one(analysis_record)

    return ResumeAnalysisResponse(
        id=analysis_id,
        filename=filename,
        analysis_date=now,
        char_count=char_count,
        word_count=len(extracted_text.split()),
        preview_text=analysis_record["preview_text"],
        contact_info=contact_info,
        sections=sections,
        categorized_skills=categorized_skills,
        flat_skills=flat_skills,
        total_skills_count=len(flat_skills),
        best_matching_role=best_role,
        best_match_score=best_score,
        recommended_jobs=job_recommendations
    )

@router.get("/history", response_model=List[ResumeHistoryItem])
async def get_resume_history(current_user: dict = Depends(get_current_user)):
    """Retrieve previous resume analysis history for current user."""
    records = resume_analyses_col.find({"user_id": current_user["_id"]}).sort("analysis_date", -1)
    history = []
    for r in records:
        history.append(ResumeHistoryItem(
            id=r["_id"],
            filename=r.get("filename", "Resume"),
            analysis_date=r.get("analysis_date", ""),
            total_skills=r.get("total_skills_count", 0),
            best_matching_role=r.get("best_matching_role"),
            best_match_score=r.get("best_match_score")
        ))
    return history

@router.get("/{analysis_id}", response_model=ResumeAnalysisResponse)
async def get_analysis_by_id(analysis_id: str, current_user: Optional[dict] = Depends(get_optional_user)):
    """Retrieve full details of a previous resume analysis by ID."""
    record = resume_analyses_col.find_one({"_id": analysis_id})
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    return ResumeAnalysisResponse(
        id=record["_id"],
        filename=record.get("filename", "Resume"),
        analysis_date=record.get("analysis_date", ""),
        char_count=record.get("char_count", 0),
        word_count=record.get("word_count", 0),
        preview_text=record.get("preview_text", ""),
        contact_info=record.get("contact_info", {}),
        sections=record.get("sections", {}),
        categorized_skills=record.get("categorized_skills", {}),
        flat_skills=record.get("flat_skills", []),
        total_skills_count=record.get("total_skills_count", 0),
        best_matching_role=record.get("best_matching_role"),
        best_match_score=record.get("best_match_score"),
        recommended_jobs=record.get("recommended_jobs", [])
    )

@router.delete("/{analysis_id}")
async def delete_analysis(analysis_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a past resume analysis."""
    record = resume_analyses_col.find_one({"_id": analysis_id, "user_id": current_user["_id"]})
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found or unauthorized.")
    resume_analyses_col.delete_one({"_id": analysis_id})
    return {"message": "Resume analysis deleted successfully."}
