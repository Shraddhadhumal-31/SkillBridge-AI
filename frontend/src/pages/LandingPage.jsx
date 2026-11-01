import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  FileSearch,
  GitCompare,
  Milestone,
  HelpCircle,
  CheckCircle2,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/70 via-purple-50/20 to-white -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>AI-Powered Career Guidance & Skill Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Build Your Skills.{' '}
            <span className="bg-gradient-to-r from-navy-900 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Discover Your Career.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The intelligent career guidance platform for college students, fresh graduates, and job seekers.
            Upload your resume, extract technical competencies with NLP, bridge your skill gaps, and follow a personalized weekly roadmap to industry success.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{user ? "Go to Dashboard" : "Get Started for Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to={user ? "/analyzer" : "/register"}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition"
            >
              <FileSearch className="w-4 h-4 text-indigo-600" />
              <span>Upload Resume</span>
            </Link>
          </div>

          {/* Platform Metric Highlights */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
              <span className="block text-2xl font-black text-slate-900">8+</span>
              <span className="text-xs font-semibold text-slate-500">Industry Job Profiles</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
              <span className="block text-2xl font-black text-indigo-600">100%</span>
              <span className="text-xs font-semibold text-slate-500">Free & Open Source</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
              <span className="block text-2xl font-black text-slate-900">7</span>
              <span className="text-xs font-semibold text-slate-500">Skill Categories</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
              <span className="block text-2xl font-black text-purple-600">Weekly</span>
              <span className="text-xs font-semibold text-slate-500">Personalized Roadmaps</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">
              Everything You Need to Land Your Dream Tech Role
            </h2>
            <p className="text-sm text-slate-600 mt-3">
              Engineered with NLP and machine learning to deliver objective, transparent skill insights without black-box hype.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Resume Parsing</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Extracts plain text and technical skills across PDF and DOCX files using PyMuPDF and strict regex boundary NLP algorithms.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                <GitCompare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Skill Gap Engine</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Compares candidate competencies against weighted industry requirements. Identifies acquired, missing, and transferable skills.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Milestone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Weekly Roadmaps</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Generates a step-by-step curriculum customized to your missing skills with estimated hours, milestone checklists, and curated tutorials.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Interview Prep</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Practice role-specific multiple-choice mock technical tests targeting your skill gaps with in-depth answer explanations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">How SkillBridge AI Works</h2>
            <p className="text-sm text-slate-600 mt-3">
              Go from uncertain job seeker to job-ready candidate with actionable steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-sm shadow-indigo-200">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">Upload Your Resume</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Upload your PDF or DOCX resume. Our parser cleans whitespace and protects privacy.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-sm shadow-indigo-200">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">NLP Skill Extraction</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Identifies programming languages, frameworks, databases, and DevOps tools automatically.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-sm shadow-indigo-200">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">Job Match & Gap Analysis</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Ranks top matching roles with TF-IDF cosine similarity and highlights missing skills.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-sm shadow-indigo-200">
                4
              </div>
              <h4 className="text-sm font-bold text-slate-900">Learn & Prepare</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Follow your weekly roadmap milestones and take mock technical quizzes to assess mastery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Built With Modern Open Source Tech
          </span>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-slate-600 text-xs font-bold">
            <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-indigo-600" /> FastAPI & Python</span>
            <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-purple-600" /> React.js & Tailwind CSS</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-600" /> Scikit-learn & TF-IDF</span>
            <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-amber-600" /> MongoDB Atlas</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-blue-600" /> JWT & Bcrypt</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-indigo-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-black">
            Ready to Accelerate Your Tech Career?
          </h2>
          <p className="mt-4 text-indigo-200 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Upload your resume today and let SkillBridge AI generate your customized career roadmap in seconds.
          </p>
          <div className="mt-8">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-indigo-900 bg-white hover:bg-indigo-50 shadow-lg shadow-indigo-950/30 transition transform hover:-translate-y-0.5"
            >
              <span>{user ? "Open Dashboard" : "Create Free Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
