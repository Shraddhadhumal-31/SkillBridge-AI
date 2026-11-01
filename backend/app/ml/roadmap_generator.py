import json
import os
from typing import Dict, List, Any

class RoadmapGenerator:
    """
    Module 5: Career Roadmap Generator
    Dynamically constructs a step-by-step weekly curriculum based on missing technical skills,
    estimated study hours, skill prerequisites, and curated educational resources.
    """

    def __init__(self, resources_path: str = None, jobs_path: str = None):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        if resources_path is None:
            resources_path = os.path.join(base_dir, "datasets", "learning_resources.json")
        if jobs_path is None:
            jobs_path = os.path.join(base_dir, "datasets", "job_profiles.json")

        self.resources_path = resources_path
        self.jobs_path = jobs_path
        self.resources_db = self._load_json(self.resources_path, {})
        self.job_profiles = self._load_json(self.jobs_path, [])

    def _load_json(self, path: str, default: Any) -> Any:
        if not os.path.exists(path):
            return default
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _get_resources_for_skill(self, skill_name: str) -> List[Dict[str, Any]]:
        """Fetch curated resources for a skill."""
        if skill_name in self.resources_db:
            return self.resources_db[skill_name]
        # Return sensible default search link
        encoded = skill_name.replace(" ", "+")
        return [
            {
                "title": f"Complete {skill_name} Guide & Tutorial",
                "provider": "Official Documentation / Developer Hub",
                "url": f"https://www.google.com/search?q={encoded}+official+documentation+tutorial",
                "type": "Documentation",
                "hours": 12
            }
        ]

    def generate_roadmap(
        self,
        target_role: str,
        missing_skills: List[str],
        current_skills: List[str] = None
    ) -> Dict[str, Any]:
        """
        Builds weekly learning milestones from missing skills.
        If user has zero missing skills, creates an advanced mastery & portfolio roadmap.
        """
        current_skills = current_skills or []

        # Find target job profile if available
        matched_job = None
        for job in self.job_profiles:
            if job.get("id") == target_role or job.get("title").lower() == target_role.lower():
                matched_job = job
                break

        role_title = matched_job["title"] if matched_job else target_role

        milestones = []
        week_counter = 1
        total_estimated_hours = 0

        # Sort missing skills: fundamentals (Languages, Databases) first, then frameworks/tools
        skill_order_priority = {
            "Python": 1, "Java": 1, "JavaScript": 1, "SQL": 1, "HTML5": 1, "CSS3": 1,
            "FastAPI": 2, "Spring Boot": 2, "React.js": 2, "Node.js": 2, "Pandas": 2,
            "PostgreSQL": 3, "MySQL": 3, "MongoDB": 3, "Tailwind CSS": 3,
            "Scikit-Learn": 4, "Machine Learning": 4, "Deep Learning": 4, "Selenium": 4, "PyTest": 4, "Postman": 4,
            "Docker": 5, "Kubernetes": 5, "AWS": 5, "Git": 5
        }

        sorted_missing = sorted(
            missing_skills,
            key=lambda s: skill_order_priority.get(s, 99)
        )

        if not sorted_missing:
            # All skills satisfied! Create advanced capstone and system design roadmap
            milestones.append({
                "milestone_id": f"ms_w1",
                "week": 1,
                "title": f"Advanced {role_title} System Architecture & Scalability",
                "objective": f"Review modern enterprise patterns, caching strategies, and asynchronous performance tuning in {role_title}.",
                "skills": ["System Design", "Scalability"],
                "estimated_hours": 15,
                "difficulty": "Advanced",
                "resources": [
                    {"title": "System Design Primer", "provider": "GitHub Community", "url": "https://github.com/donnemartin/system-design-primer", "type": "Guide", "hours": 15}
                ],
                "action_items": [
                    "Design a scalable microservice architecture with asynchronous task queues",
                    "Implement distributed caching using Redis",
                    "Conduct load testing and profile database bottlenecks"
                ],
                "completed": False
            })
            milestones.append({
                "milestone_id": f"ms_w2",
                "week": 2,
                "title": "Production Deployment, CI/CD & Live Portfolio Capstone",
                "objective": "Containerize your end-to-end applications, configure automated testing pipelines, and deploy to cloud platforms.",
                "skills": ["Docker", "CI/CD", "Cloud"],
                "estimated_hours": 18,
                "difficulty": "Advanced",
                "resources": [
                    {"title": "GitHub Actions for CI/CD", "provider": "GitHub Docs", "url": "https://docs.github.com/en/actions", "type": "Tutorial", "hours": 10}
                ],
                "action_items": [
                    "Write multi-stage Dockerfiles optimizing image size",
                    "Configure GitHub Actions to run automated pytest/jest test suites on push",
                    "Deploy live working project to Cloud Run, Render or AWS"
                ],
                "completed": False
            })
            total_estimated_hours = 33
        else:
            # Group missing skills into 1-2 skills per week
            idx = 0
            while idx < len(sorted_missing):
                current_batch = [sorted_missing[idx]]
                # If there are multiple skills and total length is > 4, pair them
                if len(sorted_missing) > 3 and (idx + 1) < len(sorted_missing):
                    current_batch.append(sorted_missing[idx + 1])
                    idx += 2
                else:
                    idx += 1

                batch_resources = []
                hours_sum = 0
                for sk in current_batch:
                    res_list = self._get_resources_for_skill(sk)
                    batch_resources.extend(res_list[:2])  # pick top 2 resources per skill
                    hours_sum += sum(r.get("hours", 10) for r in res_list[:2])

                difficulty = "Intermediate" if week_counter > 2 else "Beginner"
                skills_str = " & ".join(current_batch)

                milestones.append({
                    "milestone_id": f"ms_w{week_counter}",
                    "week": week_counter,
                    "title": f"Master {skills_str} Fundamentals & Practical Application",
                    "objective": f"Gain working competency in {skills_str}. Understand syntax, core conventions, and integration into modern {role_title} workflows.",
                    "skills": current_batch,
                    "estimated_hours": min(hours_sum, 25),
                    "difficulty": difficulty,
                    "resources": batch_resources,
                    "action_items": [
                        f"Complete the core documentation and interactive tutorials for {skills_str}",
                        f"Build a mini practice project demonstrating real-world use of {skills_str}",
                        f"Write automated tests and push repository to GitHub"
                    ],
                    "completed": False
                })
                total_estimated_hours += min(hours_sum, 25)
                week_counter += 1

            # Append a final Capstone Project milestone
            milestones.append({
                "milestone_id": f"ms_w{week_counter}",
                "week": week_counter,
                "title": f"{role_title} Full Capstone Project & Portfolio Deployment",
                "objective": f"Synthesize all acquired skills ({', '.join(sorted_missing[:4])}) into an industry-ready portfolio application.",
                "skills": sorted_missing[:3],
                "estimated_hours": 20,
                "difficulty": "Intermediate-Advanced",
                "resources": [
                    {"title": f"Building End-to-End {role_title} Projects", "provider": "Developer Community", "url": "https://github.com", "type": "Project Guide", "hours": 20}
                ],
                "action_items": [
                    "Architect and implement full application with clean repository structure",
                    "Write README with architecture diagrams and API docs",
                    "Deploy live demo on web and include repository link on your resume"
                ],
                "completed": False
            })
            total_estimated_hours += 20

        completed_count = sum(1 for m in milestones if m.get("completed", False))
        progress_percentage = round((completed_count / len(milestones) * 100) if milestones else 0.0, 1)

        return {
            "target_role": role_title,
            "total_weeks": len(milestones),
            "total_estimated_hours": total_estimated_hours,
            "total_milestones": len(milestones),
            "completed_milestones": completed_count,
            "progress_percentage": progress_percentage,
            "missing_skills_covered": sorted_missing,
            "milestones": milestones
        }
