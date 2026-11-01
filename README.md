# SkillBridge AI – Intelligent Skill Gap Analyzer & Personalized Career Roadmap

![SkillBridge AI Platform](https://img.shields.io/badge/Status-Production%20Ready-emerald?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Scikit--Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 1. Project Overview

**SkillBridge AI** is an intelligent career guidance and skill intelligence platform designed for college students, fresh graduates, and tech job seekers.

The platform allows candidates to upload resumes (in PDF or DOCX format), automatically extracts technical skills across 7 domains using Natural Language Processing (NLP), benchmarks candidate proficiencies against industry job requirements, recommends the best-fit career roles, calculates granular skill gaps, and generates personalized, weekly milestone learning roadmaps paired with mock interview assessments.

The core AI engine is 100% free and open-source, requiring no paid OpenAI/Gemini API keys to deliver transparent, objective matching scores and actionable recommendations.

---

## 2. Problem Statement & Objectives

### Problem
- College students and job seekers frequently struggle to identify how their current academic projects and skills translate into commercial industry requirements.
- Job descriptions are fragmented, verbose, and difficult to evaluate objectively.
- Generic advice platforms provide vague recommendations or black-box hiring probabilities rather than concrete, weekly learning plans.

### Objectives
1. **Automated Skill Extraction**: Parse unstructured PDF/DOCX resumes and accurately detect technical competencies across 7 standardized categories without substring false positives.
2. **Transparent Role Benchmarking**: Utilize TF-IDF vectorization, Cosine Similarity, and weighted skill coverage to compute mathematically grounded compatibility scores.
3. **Actionable Skill Gap Identification**: Distinguish acquired skills, missing requirements (weighted by priority), and transferable competencies.
4. **Step-by-Step Personalized Roadmaps**: Generate weekly learning milestones with estimated study hours, checklists, and curated free educational resources.
5. **Interview Readiness**: Provide role-specific, skill-gap-focused multiple-choice quizzes with explanations to evaluate conceptual mastery.

---

## 3. Technology Stack

### Frontend
- **Framework**: React.js 19 with Vite
- **Styling**: Tailwind CSS v4 with custom SaaS color palette (Navy Blue, Indigo, subtle Purple)
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios with automatic JWT interceptors
- **Visualizations**: Recharts (interactive Donut, Bar charts)
- **Icons**: Lucide React

### Backend
- **Framework**: Python 3.14 / FastAPI
- **Architecture**: RESTful modular API with Pydantic v2 schemas
- **Authentication**: JWT (JSON Web Tokens) with Passlib & Bcrypt password hashing
- **File Parsing**: PyMuPDF (fitz) for PDF extraction and python-docx for DOCX extraction

### AI & Machine Learning Pipeline
- **NLP Skill Extraction**: Multi-pattern regex tokenization with word boundary matching and alias normalization
- **Semantic Text Matching**: Scikit-Learn `TfidfVectorizer` (unigram & bigram extraction)
- **Similarity Computation**: Scikit-Learn `cosine_similarity`
- **Hybrid Scoring Engine**: Weighted combination of required skill coverage (80%), optional bonus competencies (10%), and semantic cosine similarity (10%)
- **Transferable Skill Clustering**: Relational cluster mapping for partial skill identification (e.g. MySQL -> PostgreSQL, React -> Vue)

### Database
- **Primary**: MongoDB Atlas / PyMongo
- **Resilience Engine**: Built-in JSON fallback data store ensuring full functionality even in offline or local test environments

---

## 4. System Architecture

```mermaid
flowchart TD
    User([User / Candidate]) -->|Uploads PDF / DOCX| Frontend[React + Tailwind Frontend]
    Frontend -->|POST /api/resume/analyze| API[FastAPI Backend Router]
    
    subgraph Backend Pipeline
        API --> Parser[Module 1: ResumeParser\nPyMuPDF & python-docx]
        Parser --> Extractor[Module 2: SkillExtractor\nNLP Regex Boundary & Taxonomy]
        Extractor --> Matcher[Module 3: JobMatcher\nTF-IDF & Cosine Similarity]
        Matcher --> Gap[Module 4: SkillGapAnalyzer\nWeighted Overlap & Transfer Detection]
        Gap --> Roadmap[Module 5: RoadmapGenerator\nCurated Resource Curriculum]
        Gap --> Interview[Module 6: InterviewGenerator\nMock Technical Assessments]
    end

    Backend Pipeline --> DB[(MongoDB Atlas / PyMongo)]
    Backend Pipeline --> Response[JSON API Response]
    Response --> Frontend
    Frontend --> Dashboard[Interactive Dashboard, Charts & Roadmap]
```

---

## 5. Main Application Features & Pages

| Page | URL | Key Capabilities |
| :--- | :--- | :--- |
| **Landing Page** | `/` | Hero banner, platform metrics, features overview, 4-step workflow, technology highlights, and call-to-action. |
| **Registration & Login** | `/register`, `/login` | Secure JWT authentication with Bcrypt password hashing and form validation. |
| **Dashboard** | `/dashboard` | User stats cards, Recharts domain distribution, active roadmap progress bar, top recommended jobs, and quick actions. |
| **Resume Analyzer** | `/analyzer` | Drag-and-drop PDF/DOCX upload, text preview, contact extraction, 7-category skill breakdown, and matching job recommendations. |
| **Job Recommendations** | `/jobs` | 8 industry developer and data profiles with match %, required/optional skills, suitability summaries, and search filters. |
| **Skill Gap Analysis** | `/skill-gap` | Granular comparison of acquired vs missing skills, transferable skill alerts, donut chart readiness score, and AI recommendations. |
| **Career Roadmap** | `/roadmap` | Weekly milestones with estimated study hours, difficulty ratings, action checklists, curated documentation links, and persistent completion toggles. |
| **AI Interview Prep** | `/interview` | Multiple-choice mock technical tests targeting skill gaps, instant grading, score breakdown, and technical explanations. |
| **Profile & History** | `/profile` | Target career preferences editor, resume analysis log with past results, and historical mock test scores. |

---

## 6. Supported Industry Job Profiles

1. **Python Developer** (FastAPI, REST APIs, PostgreSQL, Git, PyTest, Docker, Redis)
2. **Java Developer** (Java, Spring Boot, REST APIs, MySQL, Git, JUnit, Microservices)
3. **Full Stack Developer** (JavaScript, React.js, Node.js, MongoDB, REST APIs, HTML5, CSS3, Git)
4. **Frontend Developer** (JavaScript, React.js, HTML5, CSS3, Tailwind CSS, TypeScript, Git)
5. **Backend Developer** (Python, Node.js, REST APIs, PostgreSQL, MongoDB, Git, Docker, Redis)
6. **Data Analyst** (SQL, Python, Pandas, Data Visualization, NumPy, Git, Scikit-Learn)
7. **Machine Learning Engineer** (Python, Machine Learning, Scikit-Learn, Pandas, NumPy, Deep Learning)
8. **Software Tester** (Selenium WebDriver, Postman, PyTest, Git, Jira, Python)

---

## 7. API Endpoints Reference

### Authentication
- `POST /api/auth/register` — Register a new account and obtain JWT access token.
- `POST /api/auth/login` — Sign in with email and password.
- `GET /api/auth/me` — Retrieve profile data for the authenticated user.

### Resume Processing
- `POST /api/resume/upload` — Validates and extracts preview text from uploaded PDF/DOCX.
- `POST /api/resume/analyze` — Core NLP pipeline: extracts text, skills, and matches jobs.
- `GET /api/resume/history` — Returns past analysis history for current user.
- `GET /api/resume/{id}` — Retrieves full details of a specific past analysis.
- `DELETE /api/resume/{id}` — Deletes an analysis record.

### Job Benchmarks & Matching
- `GET /api/jobs` — Lists all 8 structured industry job profiles.
- `POST /api/jobs/match` — Calculates compatibility rankings for any list of skills.
- `GET /api/jobs/{id}` — Fetches details and required skills for a single job role.

### Skill Gap
- `POST /api/skills/analyze` — Compares candidate skills against job requirements, identifies gaps & transferable competencies.

### Career Roadmap
- `POST /api/roadmap/generate` — Dynamically generates weekly learning curriculum.
- `GET /api/roadmap` — Fetches current active roadmap for authenticated user.
- `PUT /api/roadmap/{id}/progress` — Toggles milestone completion and updates progress %.

### AI Interview Prep
- `POST /api/interview/generate` — Generates role-specific questions prioritizing missing skills.
- `POST /api/interview/submit` — Evaluates quiz answers, provides scores & technical explanations.
- `GET /api/interview/history` — Lists past mock interview scores.

### User & Dashboard
- `GET /api/user/profile` — Retrieves user preferences.
- `PUT /api/user/profile` — Updates target role and learning style.
- `GET /api/user/dashboard` — Aggregated dashboard telemetry.

---

## 8. Installation & Setup Instructions

### Prerequisites
- **Python**: Version 3.10+ (tested on Python 3.14)
- **Node.js**: Version 18+ (tested on Node v24)
- **MongoDB**: Local MongoDB community server or MongoDB Atlas URI (optional; automatic fallback included)

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd SkillBridge-AI/backend
   ```

2. **Create a virtual environment (optional but recommended)**:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   # .env
   PORT=8000
   HOST=0.0.0.0
   DEBUG=True
   MONGO_URI=mongodb://localhost:27017
   MONGO_DB_NAME=skillbridge_ai
   JWT_SECRET=your_secure_jwt_secret_key_here
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```

5. **Generate sample synthetic test resumes**:
   ```bash
   python datasets/generate_test_resumes.py
   ```

6. **Run the backend automated test suite**:
   ```bash
   python test_backend.py
   python test_api_endpoints.py
   ```

7. **Start the FastAPI server**:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd SkillBridge-AI/frontend
   ```

2. **Install npm packages**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Ensure `.env` exists:
   ```bash
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Build production bundle (optional test)**:
   ```bash
   npm run build
   ```

5. **Start the development server**:
   ```bash
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
   Access the web application in your browser at `http://localhost:5173`.

---

## 9. Testing & Synthetic Resumes

The application includes synthetic resumes located in `backend/datasets/sample_resumes/`:
- `synthetic_fullstack_dev.pdf` — Profile with React.js, Node.js, MongoDB, TypeScript, Tailwind CSS, Docker.
- `synthetic_python_dev.docx` — Profile with Python, FastAPI, Django, PostgreSQL, Git, PyTest.
- `synthetic_data_analyst.pdf` — Profile with SQL, Python, Pandas, NumPy, Scikit-Learn, Data Visualization.
- `synthetic_no_skills.pdf` — Non-technical resume to test zero-match and edge handling.
- `synthetic_empty.pdf` — Empty document to test parser error handling.

---

## 10. Future Enhancements

1. **Tesseract OCR Integration**: Add optical character recognition to extract text from scanned image resumes.
2. **Local LLM Chatbot**: Integrate Ollama / quantized local models for conversational resume feedback and interactive code interview simulations.
3. **LinkedIn & GitHub Profiler**: Scrape and benchmark public repositories to verify claimed resume skills.
4. **Peer Benchmarking**: Enable anonymous class or cohort-wide readiness comparison dashboards for university placement cells.

---

## 11. License

This project is licensed under the MIT License. Open source and free for educational and commercial use.
