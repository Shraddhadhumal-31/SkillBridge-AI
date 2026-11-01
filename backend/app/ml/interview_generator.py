import json
import os
import random
from typing import Dict, List, Any

class InterviewGenerator:
    """
    Module 6: Interview Question Generator & Mock Test Evaluator
    Selects targeted technical interview questions tailored to the candidate's chosen role,
    missing skills, and current skills. Evaluates mock test submissions with detailed feedback.
    """

    def __init__(self, questions_path: str = None, jobs_path: str = None):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        if questions_path is None:
            questions_path = os.path.join(base_dir, "datasets", "interview_questions.json")
        if jobs_path is None:
            jobs_path = os.path.join(base_dir, "datasets", "job_profiles.json")

        self.questions_path = questions_path
        self.jobs_path = jobs_path
        self.questions_db = self._load_json(self.questions_path, [])
        self.job_profiles = self._load_json(self.jobs_path, [])

    def _load_json(self, path: str, default: Any) -> Any:
        if not os.path.exists(path):
            return default
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def generate_interview(
        self,
        role_identifier: str,
        missing_skills: List[str] = None,
        possessed_skills: List[str] = None,
        num_questions: int = 5,
        difficulty: str = "All"
    ) -> Dict[str, Any]:
        """
        Generates a tailored quiz of MCQs.
        Prioritizes questions from missing skills so the user can test their learning gap,
        as well as questions from the target role.
        """
        missing_skills_set = set(missing_skills or [])
        possessed_skills_set = set(possessed_skills or [])

        # Match target job
        job_id = None
        job_title = role_identifier
        for j in self.job_profiles:
            if j.get("id") == role_identifier or j.get("title").lower() == role_identifier.lower():
                job_id = j.get("id")
                job_title = j.get("title")
                break

        # Filter candidate pool
        pool = []
        for q in self.questions_db:
            matches_role = (job_id and q.get("role_id") == job_id) or (q.get("role_id", "").lower() in role_identifier.lower())
            matches_skill = q.get("skill") in missing_skills_set or q.get("skill") in possessed_skills_set
            matches_diff = difficulty == "All" or q.get("difficulty", "").lower() == difficulty.lower()

            if (matches_role or matches_skill) and matches_diff:
                pool.append(q)

        # If pool is smaller than requested, fallback to any matching role questions or general questions
        if len(pool) < num_questions:
            for q in self.questions_db:
                if q not in pool:
                    pool.append(q)

        # Prioritize questions related to missing skills
        missing_skill_questions = [q for q in pool if q.get("skill") in missing_skills_set]
        other_questions = [q for q in pool if q not in missing_skill_questions]

        selected = []
        # Take up to half from missing skills
        take_missing = min(len(missing_skill_questions), num_questions // 2 + 1)
        selected.extend(missing_skill_questions[:take_missing])
        # Fill remaining
        remaining_needed = num_questions - len(selected)
        selected.extend(other_questions[:remaining_needed])

        # Prepare user-facing quiz questions (hide correct_index and explanation until submitted, or include in secure session)
        quiz_items = []
        for idx, q in enumerate(selected):
            quiz_items.append({
                "question_id": q.get("id", f"q_{idx}"),
                "question_index": idx + 1,
                "skill": q.get("skill"),
                "difficulty": q.get("difficulty"),
                "question": q.get("question"),
                "options": q.get("options")
            })

        return {
            "session_id": f"session_{job_id or 'general'}_{random.randint(1000, 9999)}",
            "role_title": job_title,
            "role_id": job_id,
            "difficulty": difficulty,
            "total_questions": len(quiz_items),
            "questions": quiz_items
        }

    def evaluate_submission(
        self,
        role_identifier: str,
        answers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Evaluates submitted answers:
        Input answers: [{"question_id": "q_py_1", "selected_index": 1}, ...]
        Returns score, percentage, breakdown, correct answers, explanations, and advice.
        """
        results_breakdown = []
        correct_count = 0
        total_questions = len(answers)

        # Index questions by id
        questions_by_id = {q.get("id"): q for q in self.questions_db}

        for item in answers:
            qid = item.get("question_id")
            selected = item.get("selected_index")

            orig = questions_by_id.get(qid)
            if not orig:
                # If question was dynamic, fallback
                continue

            is_correct = (selected == orig.get("correct_index"))
            if is_correct:
                correct_count += 1

            results_breakdown.append({
                "question_id": qid,
                "question": orig.get("question"),
                "skill": orig.get("skill"),
                "difficulty": orig.get("difficulty"),
                "options": orig.get("options"),
                "selected_index": selected,
                "correct_index": orig.get("correct_index"),
                "is_correct": is_correct,
                "explanation": orig.get("explanation")
            })

        score_percentage = round((correct_count / total_questions * 100) if total_questions else 0.0, 1)

        # Performance summary
        if score_percentage >= 80:
            rating = "Excellent"
            summary = "Outstanding performance! You have demonstrated strong technical mastery across these core concepts."
        elif score_percentage >= 60:
            rating = "Proficient"
            summary = "Solid foundational understanding. Review the explanations for questions you missed to polish your skills."
        else:
            rating = "Needs Revision"
            summary = "Key conceptual gaps identified. We recommend revisiting the learning roadmap resources before attempting your next mock test."

        return {
            "total_questions": total_questions,
            "correct_count": correct_count,
            "incorrect_count": total_questions - correct_count,
            "score_percentage": score_percentage,
            "rating": rating,
            "summary": summary,
            "breakdown": results_breakdown
        }
