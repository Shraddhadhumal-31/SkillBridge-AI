import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import seed_job_profiles_if_empty
from app.routes import auth, resume, jobs, skills, roadmap, interview, user

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    print(f"[SkillBridge AI] Initializing backend services...")
    seed_job_profiles_if_empty()
    yield
    # Shutdown actions
    print(f"[SkillBridge AI] Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Skill Gap Analyzer & Personalized Career Roadmap Backend API",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for seamless development and testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(resume.router, prefix=settings.API_PREFIX)
app.include_router(jobs.router, prefix=settings.API_PREFIX)
app.include_router(skills.router, prefix=settings.API_PREFIX)
app.include_router(roadmap.router, prefix=settings.API_PREFIX)
app.include_router(interview.router, prefix=settings.API_PREFIX)
app.include_router(user.router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    return {
        "app": "SkillBridge AI API",
        "status": "Online",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "Healthy",
        "service": "SkillBridge AI Engine",
        "nlp_ready": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
