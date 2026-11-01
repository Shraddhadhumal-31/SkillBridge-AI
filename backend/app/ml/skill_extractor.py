import re
import json
import os
from typing import Dict, List, Set, Any

class SkillExtractor:
    """
    Module 2: Skill Extraction
    Extracts technical skills across 7 categories using robust regex word boundaries,
    normalized alias mapping, and taxonomy lookup.
    Guarantees no substring false positives.
    """

    def __init__(self, taxonomy_path: str = None):
        if taxonomy_path is None:
            # Default to backend/datasets/skills_taxonomy.json
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            taxonomy_path = os.path.join(base_dir, "datasets", "skills_taxonomy.json")

        self.taxonomy_path = taxonomy_path
        self.categories_data = self._load_taxonomy()
        self._compiled_patterns = self._build_compiled_patterns()

    def _load_taxonomy(self) -> Dict[str, Any]:
        """Load skills taxonomy from JSON."""
        if not os.path.exists(self.taxonomy_path):
            return {}
        with open(self.taxonomy_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("categories", {})

    def _build_compiled_patterns(self) -> List[Dict[str, Any]]:
        """
        Pre-compile regex patterns for high performance and strict boundary matching.
        Handles tricky special tokens like C++, C#, .NET, Node.js, React.js without false matches.
        """
        patterns = []
        for cat_key, cat_val in self.categories_data.items():
            for skill_entry in cat_val.get("skills", []):
                canonical_name = skill_entry["name"]
                aliases = skill_entry.get("aliases", [])

                for alias in aliases:
                    alias_clean = alias.strip().lower()
                    # Custom regex boundary handling for symbols
                    if alias_clean in ["c++", "cpp"]:
                        # Match C++ with non-word boundary or whitespace/punctuation
                        pattern = r"(?i)(?:^|[\s,;/()\[\]{}])(c\+\+|cpp)(?:$|[\s,;/()\[\]{}])"
                    elif alias_clean in ["c#", "csharp", "c sharp"]:
                        pattern = r"(?i)(?:^|[\s,;/()\[\]{}])(c#|csharp|c\s+sharp)(?:$|[\s,;/()\[\]{}])"
                    elif alias_clean == "c":
                        # Require strict standalone 'C' surrounded by punctuation or whitespace
                        pattern = r"(?:^|[\s,;/()\[\]{}])(C)(?:$|[\s,;/()\[\]{}])"
                    elif alias_clean == "r":
                        pattern = r"(?:^|[\s,;/()\[\]{}])(R)(?:$|[\s,;/()\[\]{}])"
                    elif alias_clean == "go":
                        # Distinguish 'go' language from English verb 'go'
                        pattern = r"(?i)(?:^|[\s,;/()\[\]{}])(golang|go\s+language)(?:$|[\s,;/()\[\]{}])"
                    elif "." in alias_clean or "+" in alias_clean or "#" in alias_clean or "/" in alias_clean or "-" in alias_clean:
                        escaped = re.escape(alias_clean)
                        pattern = r"(?i)(?:^|[\s,;/()\[\]{}])(" + escaped + r")(?:$|[\s,;/()\[\]{}])"
                    else:
                        pattern = rf"(?i)\b({re.escape(alias_clean)})\b"

                    patterns.append({
                        "regex": re.compile(pattern),
                        "canonical_name": canonical_name,
                        "category": cat_key,
                        "category_name": cat_val.get("display_name", cat_key),
                        "alias": alias_clean,
                        "length": len(alias_clean)  # For sorting priority (longer phrases matched first)
                    })

        # Sort so multi-word patterns match before single-word subsets (e.g. "React Native" before "React")
        patterns.sort(key=lambda x: x["length"], reverse=True)
        return patterns

    def extract_skills(self, text: str) -> Dict[str, Any]:
        """
        Extracts skills from input text, categorizes them, and removes duplicates.
        Returns:
            {
                "categorized": {
                    "programming_languages": ["Python", "JavaScript"],
                    "frontend": ["React.js"],
                    ...
                },
                "flat_skills": ["Python", "JavaScript", "React.js"],
                "total_skills_count": 3
            }
        """
        if not text:
            return {
                "categorized": {k: [] for k in self.categories_data.keys()},
                "flat_skills": [],
                "total_skills_count": 0
            }

        matched_skills: Set[str] = set()
        categorized_results: Dict[str, List[str]] = {k: [] for k in self.categories_data.keys()}
        skill_to_category: Dict[str, str] = {}

        for item in self._compiled_patterns:
            canonical = item["canonical_name"]
            cat_key = item["category"]

            if canonical in matched_skills:
                continue

            if item["regex"].search(text):
                matched_skills.add(canonical)
                skill_to_category[canonical] = cat_key

        # Populate categories
        for skill in matched_skills:
            cat = skill_to_category[skill]
            if cat in categorized_results:
                categorized_results[cat].append(skill)

        # Sort within each category for clean presentation
        for cat in categorized_results:
            categorized_results[cat].sort()

        flat_list = sorted(list(matched_skills))

        return {
            "categorized": categorized_results,
            "flat_skills": flat_list,
            "total_skills_count": len(flat_list)
        }
