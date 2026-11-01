import os
import sys
import pytest

# Ensure app package is importable
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app.ml.resume_parser import ResumeParser
from app.ml.skill_extractor import SkillExtractor
from app.ml.job_matcher import JobMatcher
from app.ml.skill_gap_analyzer import SkillGapAnalyzer
from app.ml.roadmap_generator import RoadmapGenerator
from app.ml.interview_generator import InterviewGenerator

def test_resume_parser_pdf():
    sample_pdf = os.path.join(current_dir, "datasets", "sample_resumes", "synthetic_fullstack_dev.pdf")
    parsed = ResumeParser.parse(sample_pdf)
    assert parsed["char_count"] > 100
    assert "Alex Chen" in parsed["raw_text"] or "ALEX CHEN" in parsed["raw_text"]
    assert parsed["contact_info"]["email"] == "alex.chen@example.com"
    print("[PASS] test_resume_parser_pdf passed")

def test_resume_parser_docx():
    sample_docx = os.path.join(current_dir, "datasets", "sample_resumes", "synthetic_python_dev.docx")
    parsed = ResumeParser.parse(sample_docx)
    assert parsed["char_count"] > 100
    assert "Priya Sharma" in parsed["raw_text"] or "PRIYA SHARMA" in parsed["raw_text"]
    assert "FastAPI" in parsed["raw_text"]
    print("[PASS] test_resume_parser_docx passed")

def test_skill_extractor():
    extractor = SkillExtractor()
    sample_text = "I have 3 years of experience writing Python and FastAPI APIs with MongoDB, Docker, and React.js."
    res = extractor.extract_skills(sample_text)
    extracted = set(res["flat_skills"])
    assert "Python" in extracted
    assert "FastAPI" in extracted
    assert "MongoDB" in extracted
    assert "React.js" in extracted
    assert "Docker" in extracted
    # Verify no substring false positives like 'C'
    assert "C" not in extracted
    assert "Go" not in extracted
    print(f"[PASS] test_skill_extractor passed: {extracted}")

def test_job_matcher():
    matcher = JobMatcher()
    python_skills = ["Python", "FastAPI", "REST API", "PostgreSQL", "PyTest", "Git"]
    matches = matcher.match_jobs(python_skills)
    assert len(matches) == 8
    # Top match should be Python Developer
    top_role = matches[0]["job_title"]
    top_score = matches[0]["match_percentage"]
    assert top_role == "Python Developer"
    assert top_score >= 80.0
    print(f"[PASS] test_job_matcher passed: Top role is '{top_role}' with score {top_score}%")

def test_skill_gap_analyzer():
    analyzer = SkillGapAnalyzer()
    # User has Python & Git, but missing FastAPI & PostgreSQL for Python Developer
    partial_skills = ["Python", "Git", "MySQL"]
    gap = analyzer.analyze_gap(partial_skills, "job_python_dev")
    assert gap["job_title"] == "Python Developer"
    missing_names = [m["name"] for m in gap["missing_skills"]]
    assert "FastAPI" in missing_names
    assert "PostgreSQL" in missing_names
    # Check related transfer: MySQL possessed when PostgreSQL is missing
    assert len(gap["partial_related_skills"]) > 0
    assert gap["compatibility_percentage"] > 0
    print(f"[PASS] test_skill_gap_analyzer passed: Detected missing skills {missing_names}")

def test_roadmap_generator():
    gen = RoadmapGenerator()
    roadmap = gen.generate_roadmap("Python Developer", ["FastAPI", "PostgreSQL", "PyTest"])
    assert roadmap["total_weeks"] >= 2
    assert len(roadmap["milestones"]) >= 2
    for m in roadmap["milestones"]:
        assert len(m["resources"]) > 0
        assert "http" in m["resources"][0]["url"]
    print(f"[PASS] test_roadmap_generator passed: Generated {roadmap['total_weeks']} weeks roadmap")

def test_interview_generator():
    igen = InterviewGenerator()
    quiz = igen.generate_interview("job_python_dev", missing_skills=["FastAPI"], num_questions=3)
    assert len(quiz["questions"]) == 3
    # Test submission evaluation
    sample_answers = [{"question_id": q["question_id"], "selected_index": 1} for q in quiz["questions"]]
    evaluation = igen.evaluate_submission("job_python_dev", sample_answers)
    assert "score_percentage" in evaluation
    assert len(evaluation["breakdown"]) == 3
    print(f"[PASS] test_interview_generator passed: Evaluated score {evaluation['score_percentage']}%")

if __name__ == "__main__":
    print("Running SkillBridge AI Backend Test Suite...")
    test_resume_parser_pdf()
    test_resume_parser_docx()
    test_skill_extractor()
    test_job_matcher()
    test_skill_gap_analyzer()
    test_roadmap_generator()
    test_interview_generator()
    print("\nALL BACKEND AI/ML TESTS PASSED SUCCESSFULLY!")
