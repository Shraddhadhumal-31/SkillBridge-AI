import json
import os
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class JobMatcher:
    """
    Module 3: Job Matching Engine
    Computes transparent job compatibility using TF-IDF vectorization, cosine similarity,
    and weighted skill coverage analysis.
    """

    def __init__(self, job_profiles_path: str = None):
        if job_profiles_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            job_profiles_path = os.path.join(base_dir, "datasets", "job_profiles.json")

        self.job_profiles_path = job_profiles_path
        self.job_profiles = self._load_job_profiles()
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self._corpus = [self._build_job_text_representation(job) for job in self.job_profiles]
        if self._corpus:
            self.job_vectors = self.vectorizer.fit_transform(self._corpus)
        else:
            self.job_vectors = None

    def _load_job_profiles(self) -> List[Dict[str, Any]]:
        """Load job profiles dataset."""
        if not os.path.exists(self.job_profiles_path):
            return []
        with open(self.job_profiles_path, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def _build_job_text_representation(job: Dict[str, Any]) -> str:
        """Create a composite textual representation of a job profile for TF-IDF."""
        required = " ".join([s["name"] for s in job.get("required_skills", [])])
        optional = " ".join([s["name"] for s in job.get("optional_skills", [])])
        topics = " ".join(job.get("interview_topics", []))
        return f"{job.get('title', '')} {job.get('description', '')} {required} {required} {optional} {topics}"

    def match_jobs(self, extracted_skills: List[str], resume_text: str = "") -> List[Dict[str, Any]]:
        """
        Calculates match score between candidate's extracted skills/resume and all job profiles.
        Returns ranked list of job recommendations with transparent score breakdowns.
        """
        if not self.job_profiles:
            return []

        user_skills_set = set(extracted_skills)
        # Create text representation of user skills and resume
        skills_text = " ".join(extracted_skills)
        user_doc = f"{skills_text} {skills_text} {resume_text[:2000]}"

        # Compute TF-IDF Cosine Similarity
        cosine_scores = np.zeros(len(self.job_profiles))
        if self.job_vectors is not None and user_doc.strip():
            user_vec = self.vectorizer.transform([user_doc])
            sim_matrix = cosine_similarity(user_vec, self.job_vectors)
            cosine_scores = sim_matrix[0]

        results = []

        for idx, job in enumerate(self.job_profiles):
            req_skills = job.get("required_skills", [])
            opt_skills = job.get("optional_skills", [])

            total_req_weight = sum(s.get("weight", 1.0) for s in req_skills) or 1.0
            matched_req = []
            missing_req = []
            matched_req_weight = 0.0

            for s in req_skills:
                skill_name = s["name"]
                if skill_name in user_skills_set:
                    matched_req.append(skill_name)
                    matched_req_weight += s.get("weight", 1.0)
                else:
                    missing_req.append({
                        "name": skill_name,
                        "weight": s.get("weight", 1.0),
                        "importance": s.get("importance", "High")
                    })

            # Check optional skills
            matched_opt = []
            missing_opt = []
            total_opt_weight = sum(s.get("weight", 0.5) for s in opt_skills) or 1.0
            matched_opt_weight = 0.0
            for s in opt_skills:
                skill_name = s["name"]
                if skill_name in user_skills_set:
                    matched_opt.append(skill_name)
                    matched_opt_weight += s.get("weight", 0.5)
                else:
                    missing_opt.append(skill_name)

            # Skill coverage percentage calculation
            skill_coverage_ratio = matched_req_weight / total_req_weight
            opt_coverage_ratio = matched_opt_weight / total_opt_weight

            # Hybrid score: 80% weighted required skills + 10% optional skills + 10% TF-IDF cosine similarity
            cos_val = float(cosine_scores[idx])
            base_score = (skill_coverage_ratio * 0.80) + (opt_coverage_ratio * 0.10) + (cos_val * 0.10)
            if skill_coverage_ratio >= 0.95:
                base_score = min(1.0, base_score + 0.05)
            # Normalize to 0-100 range and round
            match_percentage = min(100.0, max(0.0, round(base_score * 100, 1)))

            # Skill coverage raw percentage
            req_coverage_pct = round((len(matched_req) / len(req_skills) * 100) if req_skills else 0, 1)

            # Transparent explanation
            explanation = (
                f"Match score of {match_percentage}% is computed from {len(matched_req)}/{len(req_skills)} "
                f"matched required skills (weighted coverage: {round(skill_coverage_ratio * 100, 1)}%) "
                f"and semantic relevance score of {round(cos_val * 100, 1)}%."
            )

            results.append({
                "job_id": job.get("id"),
                "job_title": job.get("title"),
                "category": job.get("category"),
                "description": job.get("description"),
                "match_percentage": match_percentage,
                "required_coverage_percentage": req_coverage_pct,
                "matched_required_skills": matched_req,
                "missing_required_skills": missing_req,
                "matched_optional_skills": matched_opt,
                "missing_optional_skills": missing_opt,
                "explanation": explanation,
                "career_suitability_summary": job.get("career_suitability_summary", ""),
                "interview_topics": job.get("interview_topics", []),
                "learning_resources": job.get("learning_resources", [])
            })

        # Rank jobs by match percentage descending
        results.sort(key=lambda x: x["match_percentage"], reverse=True)
        return results

    def get_job_by_id(self, job_id: str) -> Dict[str, Any]:
        """Fetch single job profile by ID."""
        for job in self.job_profiles:
            if job.get("id") == job_id or job.get("title").lower() == job_id.lower():
                return job
        return None
