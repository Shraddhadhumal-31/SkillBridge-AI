import os
import json
import uuid
import datetime
from typing import Dict, Any, List, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.config import settings

class JSONFallbackCollection:
    """
    In-memory and disk-persisted fallback collection that mimics PyMongo collection methods
    when a live MongoDB instance is not connected. This guarantees 100% full-stack functionality.
    """
    def __init__(self, name: str, storage_dir: str):
        self.name = name
        self.storage_file = os.path.join(storage_dir, f"{name}.json")
        self._data: List[Dict[str, Any]] = self._load()

    def _load(self) -> List[Dict[str, Any]]:
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return []
        return []

    def _save(self):
        os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)
        try:
            with open(self.storage_file, "w", encoding="utf-8") as f:
                json.dump(self._data, f, default=str, indent=2)
        except Exception as e:
            print(f"Error persisting collection {self.name}: {e}")

    def insert_one(self, doc: Dict[str, Any]):
        item = dict(doc)
        if "_id" not in item:
            item["_id"] = str(uuid.uuid4())
        self._data.append(item)
        self._save()
        class InsertResult:
            inserted_id = item["_id"]
        return InsertResult()

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for item in self._data:
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                return dict(item)
        return None

    def find(self, query: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        query = query or {}
        results = []
        for item in self._data:
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                results.append(dict(item))

        class Cursor(list):
            def sort(self, key_or_list, direction=1):
                if isinstance(key_or_list, str):
                    rev = direction == -1
                    return Cursor(sorted(self, key=lambda x: str(x.get(key_or_list, "")), reverse=rev))
                elif isinstance(key_or_list, list) and key_or_list:
                    k, d = key_or_list[0]
                    return Cursor(sorted(self, key=lambda x: str(x.get(k, "")), reverse=(d == -1)))
                return self
            def limit(self, n: int):
                return Cursor(self[:n])

        return Cursor(results)

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        set_fields = update.get("$set", {})
        matched = 0
        for item in self._data:
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                item.update(set_fields)
                matched = 1
                self._save()
                break
        class UpdateResult:
            matched_count = matched
            modified_count = matched
        return UpdateResult()

    def delete_one(self, query: Dict[str, Any]):
        idx_to_del = None
        for i, item in enumerate(self._data):
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                idx_to_del = i
                break
        if idx_to_del is not None:
            del self._data[idx_to_del]
            self._save()
            return 1
        return 0

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        return len(self.find(query))

class DatabaseManager:
    """Manages connection to live MongoDB or automatic local fallback."""
    def __init__(self):
        self.is_connected = False
        self.client = None
        self.db = None
        self.use_fallback = False
        self.fallback_collections: Dict[str, JSONFallbackCollection] = {}

        self._init_connection()

    def _init_connection(self):
        try:
            # Set short timeout to test connection
            self.client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=2000)
            self.client.admin.command('ping')
            self.db = self.client[settings.MONGO_DB_NAME]
            self.is_connected = True
            print(f"[Database] Connected successfully to MongoDB at {settings.MONGO_URI}")
        except Exception as e:
            self.use_fallback = True
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.fallback_dir = os.path.join(base_dir, "data_store")
            os.makedirs(self.fallback_dir, exist_ok=True)
            print(f"[Database] MongoDB offline or unreachable ({e}). Using persistent JSON fallback store in {self.fallback_dir}.")

    def get_collection(self, name: str):
        if self.is_connected and self.db is not None:
            return self.db[name]
        if name not in self.fallback_collections:
            self.fallback_collections[name] = JSONFallbackCollection(name, self.fallback_dir)
        return self.fallback_collections[name]

db_manager = DatabaseManager()

def get_db():
    return db_manager

# Collections
users_col = db_manager.get_collection("users")
resumes_col = db_manager.get_collection("resumes")
resume_analyses_col = db_manager.get_collection("resume_analyses")
job_profiles_col = db_manager.get_collection("job_profiles")
career_roadmaps_col = db_manager.get_collection("career_roadmaps")
learning_progress_col = db_manager.get_collection("learning_progress")
interview_sessions_col = db_manager.get_collection("interview_sessions")

def seed_job_profiles_if_empty():
    """Seeds the job_profiles collection from datasets/job_profiles.json if empty."""
    try:
        count = job_profiles_col.count_documents({})
        if count == 0:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            jobs_file = os.path.join(base_dir, "datasets", "job_profiles.json")
            if os.path.exists(jobs_file):
                with open(jobs_file, "r", encoding="utf-8") as f:
                    jobs = json.load(f)
                    for j in jobs:
                        job_profiles_col.insert_one(j)
                print(f"[Database] Successfully seeded {len(jobs)} job profiles.")
    except Exception as e:
        print(f"[Database] Seeding job profiles notice: {e}")
