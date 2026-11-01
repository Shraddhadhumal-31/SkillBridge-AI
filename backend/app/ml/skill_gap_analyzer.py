import json
import os
from typing import Dict, List, Any, Set

class SkillGapAnalyzer:
    """
    Module 4: Skill Gap Analyzer
    Performs deep comparative analysis between candidate's acquired skills
    and target job role requirements, detecting matched, missing, and related skills.
    """

    # Related skill clusters for partial matching/transferable skill detection
    RELATED_SKILL_CLUSTERS = [
        {"PostgreSQL", "MySQL", "Oracle Database", "Microsoft SQL Server", "SQLite"},
        {"React.js", "Vue.js", "Angular", "Next.js"},
        {"FastAPI", "Flask", "Django"},
        {"Node.js", "Express.js"},
        {"PyTest", "JUnit", "Selenium", "Cypress"},
        {"MongoDB", "Cassandra", "Firebase Firestore"},
        {"AWS", "Google Cloud Platform", "Microsoft Azure"},
        {"Pandas", "NumPy", "SQL"},
        {"Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision"}
    ]

    def __init__(self, job_profiles_path: str = None):
        if job_profiles_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            job_profiles_path = os.path.join(base_dir, "datasets", "job_profiles.json")

        self.job_profiles_path = job_profiles_path
        self.job_profiles = self._load_job_profiles()

    def _load_job_profiles(self) -> List[Dict[str, Any]]:
        if not os.path.exists(self.job_profiles_path):
            return []
        with open(self.job_profiles_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _find_job(self, job_identifier: str) -> Dict[str, Any]:
        for job in self.job_profiles:
            if job.get("id") == job_identifier or job.get("title").lower() == job_identifier.lower():
                return job
        return None

    def _find_related_skills(self, missing_skill: str, user_skills: Set[str]) -> List[str]:
        """Find if user has a related/transferable skill in the same cluster."""
        related = []
        for cluster in self.RELATED_SKILL_CLUSTERS:
            if missing_skill in cluster:
                for user_s in user_skills:
                    if user_s in cluster and user_s != missing_skill:
                        related.append(user_s)
        return list(set(related))

    def analyze_gap(self, extracted_skills: List[str], job_identifier: str) -> Dict[str, Any]:
        """
        Calculates granular gap metrics, missing skill priorities, transferable competencies,
        and generates custom recommendations.
        """
        job = self._find_job(job_identifier)
        if not job:
            raise ValueError(f"Job profile '{job_identifier}' not found in dataset.")

        user_skills_set = set(extracted_skills)
        req_skills = job.get("required_skills", [])
        opt_skills = job.get("optional_skills", [])

        total_req_count = len(req_skills)
        matched_required = []
        missing_required = []
        partial_related_skills = []

        total_req_weight = sum(s.get("weight", 1.0) for s in req_skills) or 1.0
        matched_req_weight = 0.0

        for s in req_skills:
            skill_name = s["name"]
            weight = s.get("weight", 1.0)
            importance = s.get("importance", "High")

            if skill_name in user_skills_set:
                matched_required.append({
                    "name": skill_name,
                    "weight": weight,
                    "importance": importance,
                    "status": "Acquired"
                })
                matched_req_weight += weight
            else:
                related_transfers = self._find_related_skills(skill_name, user_skills_set)
                if related_transfers:
                    partial_related_skills.append({
                        "missing_skill": skill_name,
                        "related_possessed": related_transfers,
                        "transfer_note": f"You possess {', '.join(related_transfers)}, which gives you a strong foundation to quickly learn {skill_name}."
                    })

                missing_required.append({
                    "name": skill_name,
                    "weight": weight,
                    "importance": importance,
                    "status": "Missing",
                    "priority": "High" if weight >= 0.85 else "Medium"
                })

        # Process optional skills
        matched_optional = []
        missing_optional = []
        for s in opt_skills:
            skill_name = s["name"]
            if skill_name in user_skills_set:
                matched_optional.append(skill_name)
            else:
                missing_optional.append(skill_name)

        # Standard Formula: (Matched Required / Total Required) * 100
        raw_coverage_pct = round((len(matched_required) / total_req_count * 100) if total_req_count else 0.0, 1)
        # Weighted coverage
        weighted_coverage_pct = round((matched_req_weight / total_req_weight * 100), 1)

        # Generate action-oriented recommendations
        recommendations = []
        if missing_required:
            top_missing = sorted(missing_required, key=lambda x: x["weight"], reverse=True)
            for m in top_missing[:3]:
                recommendations.append({
                    "skill": m["name"],
                    "priority": m["priority"],
                    "action": f"Focus on mastering {m['name']} as it is a core {m['importance'].lower()} requirement for {job['title']} roles.",
                    "learning_type": "Core Requirement"
                })

        for p in partial_related_skills:
            recommendations.append({
                "skill": p["missing_skill"],
                "priority": "Accelerated",
                "action": p["transfer_note"],
                "learning_type": "Skill Transfer"
            })

        if not missing_required:
            recommendations.append({
                "skill": "Advanced Architecture",
                "priority": "Bonus",
                "action": f"You meet all primary technical requirements for {job['title']}! Deepen your portfolio with production CI/CD deployments and system design practice.",
                "learning_type": "Excellence"
            })

        return {
            "job_id": job.get("id"),
            "job_title": job.get("title"),
            "category": job.get("category"),
            "total_required_skills": total_req_count,
            "matched_required_count": len(matched_required),
            "missing_required_count": len(missing_required),
            "raw_coverage_percentage": raw_coverage_pct,
            "weighted_coverage_percentage": weighted_coverage_pct,
            "compatibility_percentage": weighted_coverage_pct,
            "matched_skills": matched_required,
            "missing_skills": missing_required,
            "partial_related_skills": partial_related_skills,
            "matched_optional_skills": matched_optional,
            "missing_optional_skills": missing_optional,
            "recommendations": recommendations,
            "description": job.get("description", "")
        }
