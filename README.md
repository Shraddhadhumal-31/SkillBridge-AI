# SkillBridge AI 🚀
### Intelligent Skill Gap Analyzer & Personalized Career Roadmap

![React](https://img.shields.io/badge/Frontend-React_19_+_Tailwind_CSS-blue?style=flat-square)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI_+_Python-009688?style=flat-square)
![ML](https://img.shields.io/badge/AI_Engine-NLP_+_Scikit--Learn-orange?style=flat-square)
![Database](https://img.shields.io/badge/Database-MongoDB-success?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)

---

## 📌 Overview

**SkillBridge AI** is an AI-powered career intelligence web platform designed for students, fresh graduates, and tech job seekers.

It analyzes resumes in **PDF** or **DOCX** format, automatically extracts technical skills using Natural Language Processing (NLP), compares candidate competencies with real-world industry requirements, calculates skill gaps, and generates a personalized **weekly milestone learning roadmap** accompanied by **mock technical interview assessments**.

---

## ✨ Key Features

- **Automated Resume Parsing**: Fast extraction of text, contact details, education, and experience from PDF and DOCX files.
- **NLP Skill Categorization**: Categorizes extracted competencies into Programming Languages, Frontend, Backend, Databases, AI/ML, Cloud/DevOps, and Tools.
- **Transparent Role Matching**: Evaluates match compatibility against 8 industry roles using TF-IDF vectorization and weighted skill coverage.
- **Granular Skill Gap Analysis**: Identifies acquired skills, missing requirements (prioritized by weight), and transferable competencies.
- **Weekly Career Roadmaps**: Generates custom milestones with estimated study hours, checklists, and curated free resources.
- **AI Mock Technical Interviews**: Multiple-choice assessments tailored to your skill gaps with instant scoring and explanations.
- **Interactive Dashboard**: Real-time telemetry, readiness distribution charts (Recharts), and past analysis history.

---

## 🏛️ System Architecture

```text
[ Candidate Resume ] 
       │ (PDF / DOCX)
       ▼
┌─────────────────────────────────────────────────────────────┐
│                      SkillBridge AI                         │
│                                                             │
│  1. Resume Parser     ──► Extracts Text & Metadata          │
│  2. Skill Extractor   ──► Multi-Category NLP Tokenization   │
│  3. Job Matcher       ──► TF-IDF & Cosine Similarity        │
│  4. Skill Gap Engine  ──► Weighted Gap & Transfer Detection │
│  5. Roadmap Engine    ──► Personalized Weekly Milestones    │
│  6. Interview Prep    ──► Targeted MCQ Assessment           │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
[ Interactive Dashboard & Learning Roadmaps ]
```

---

## 💻 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Tailwind CSS, React Router DOM, Axios, Recharts, Lucide Icons |
| **Backend** | Python, FastAPI, Pydantic, Uvicorn, REST API |
| **AI / NLP** | Scikit-learn, TF-IDF Vectorizer, Cosine Similarity, PyMuPDF, python-docx |
| **Database** | MongoDB Atlas / PyMongo (with auto JSON fallback store) |
| **Auth** | JWT (JSON Web Tokens), Passlib, Bcrypt |

---

## 🎯 Supported Industry Job Profiles

1. **Python Developer**
2. **Java Developer**
3. **Full Stack Developer**
4. **Frontend Developer**
5. **Backend Developer**
6. **Data Analyst**
7. **Machine Learning Engineer**
8. **Software Tester**

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API docs available at: `http://127.0.0.1:8000/docs`*

### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
*Open application at: `http://localhost:5173`*

---

## 🧪 Verification & Testing

Run the automated backend test suite:
```bash
cd backend
python test_backend.py
python test_api_endpoints.py
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
