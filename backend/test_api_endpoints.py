import os
import sys
from fastapi.testclient import TestClient

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "Healthy"
    print("[PASS] Health endpoint OK")

def test_auth_workflow():
    # 1. Register
    reg_payload = {
        "full_name": "Test Student",
        "email": "test.student@example.com",
        "password": "Password123!"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    if res.status_code == 400 and "already exists" in res.text:
        # User exists, login
        login_res = client.post("/api/auth/login", json={"email": reg_payload["email"], "password": reg_payload["password"]})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
    else:
        assert res.status_code == 201
        token = res.json()["access_token"]

    # 2. Get Me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "test.student@example.com"
    print("[PASS] Auth workflow OK")
    return token

def test_jobs_endpoints():
    res = client.get("/api/jobs")
    assert res.status_code == 200
    jobs = res.json()
    assert len(jobs) >= 8
    print(f"[PASS] Jobs list OK ({len(jobs)} jobs loaded)")

    # Match jobs
    match_res = client.post("/api/jobs/match", json={"skills": ["Python", "FastAPI", "PostgreSQL"]})
    assert match_res.status_code == 200
    assert len(match_res.json()) >= 8
    print("[PASS] Job matching endpoint OK")

def test_resume_analysis(token):
    sample_pdf = os.path.join(current_dir, "datasets", "sample_resumes", "synthetic_fullstack_dev.pdf")
    with open(sample_pdf, "rb") as f:
        res = client.post(
            "/api/resume/analyze",
            files={"file": ("synthetic_fullstack_dev.pdf", f, "application/pdf")},
            headers={"Authorization": f"Bearer {token}"}
        )
    assert res.status_code == 200
    data = res.json()
    assert data["total_skills_count"] > 5
    assert len(data["recommended_jobs"]) == 8
    print(f"[PASS] Resume analysis endpoint OK: Extracted {data['total_skills_count']} skills, best role: {data['best_matching_role']}")
    return data["id"]

def test_skill_gap():
    res = client.post("/api/skills/analyze", json={
        "skills": ["JavaScript", "React.js", "HTML5", "CSS3"],
        "job_id": "job_frontend_dev"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["job_title"] == "Frontend Developer"
    assert data["compatibility_percentage"] > 0
    print("[PASS] Skill gap analysis endpoint OK")

def test_roadmap_endpoints(token):
    res = client.post("/api/roadmap/generate", json={
        "target_role": "Frontend Developer",
        "missing_skills": ["Tailwind CSS", "Git"],
        "current_skills": ["React.js", "JavaScript"]
    }, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["total_weeks"] >= 2
    roadmap_id = data["id"]
    first_ms = data["milestones"][0]["milestone_id"]

    # Update progress
    up_res = client.put(f"/api/roadmap/{roadmap_id}/progress", json={
        "milestone_id": first_ms,
        "completed": True
    }, headers={"Authorization": f"Bearer {token}"})
    assert up_res.status_code == 200
    assert up_res.json()["completed_milestones"] == 1
    print("[PASS] Roadmap generation & progress tracking OK")

def test_interview_endpoints(token):
    res = client.post("/api/interview/generate", json={
        "role_id": "job_python_dev",
        "missing_skills": ["FastAPI"],
        "num_questions": 3
    }, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert len(data["questions"]) == 3
    questions = data["questions"]

    # Submit test
    sub_res = client.post("/api/interview/submit", json={
        "session_id": data["session_id"],
        "role_id": "job_python_dev",
        "answers": [{"question_id": q["question_id"], "selected_index": 1} for q in questions]
    }, headers={"Authorization": f"Bearer {token}"})
    assert sub_res.status_code == 200
    assert "score_percentage" in sub_res.json()
    print("[PASS] Interview generation & test evaluation OK")

def test_dashboard_endpoint(token):
    res = client.get("/api/user/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["total_analyses"] >= 1
    print("[PASS] User dashboard endpoint OK")

if __name__ == "__main__":
    print("Testing FastAPI Endpoints...")
    test_health()
    token = test_auth_workflow()
    test_jobs_endpoints()
    test_resume_analysis(token)
    test_skill_gap()
    test_roadmap_endpoints(token)
    test_interview_endpoints(token)
    test_dashboard_endpoint(token)
    print("\nALL FASTAPI ENDPOINTS VERIFIED & WORKING PERFECTLY!")
