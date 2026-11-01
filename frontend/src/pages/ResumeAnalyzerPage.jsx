import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ResumeUpload from '../components/ResumeUpload';
import SkillBadge from '../components/SkillBadge';
import JobMatchCard from '../components/JobMatchCard';
import ErrorMessage from '../components/ErrorMessage';
import {
  FileText,
  Sparkles,
  Layers,
  GraduationCap,
  Briefcase,
  Mail,
  Phone,
  Globe,
  Code,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function ResumeAnalyzerPage() {
  const navigate = useNavigate();
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async ({ file, rawText }) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else if (rawText) {
      formData.append('raw_text', rawText);
    }

    try {
      const res = await api.post('/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAnalysisResult(res.data);
      // Also store in sessionStorage so user can navigate back
      sessionStorage.setItem('latest_analysis', JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          'Failed to analyze resume. Please ensure the file is valid and readable.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectJobForGap = (job) => {
    navigate(`/skill-gap?role=${encodeURIComponent(job.job_title)}`);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            Intelligent NLP Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          Resume Skill Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Upload your resume in PDF or DOCX format. Our NLP extraction pipeline parses technical competencies, validates contact sections, and benchmarks your readiness against top tech career profiles.
        </p>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {/* Upload Component */}
      <ResumeUpload onAnalyze={handleAnalyze} isLoading={isLoading} />

      {/* Analysis Results View */}
      {analysisResult && (
        <div className="space-y-8 animate-fadeIn">
          {/* Executive Summary Card */}
          <div className="bg-gradient-to-r from-navy-900 via-indigo-900 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-md">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-indigo-200 mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Analysis Completed
                </span>
                <h2 className="text-2xl font-black">
                  Resume Evaluation Summary
                </h2>
                <p className="text-xs text-indigo-200 mt-1">
                  File: <span className="font-semibold text-white">{analysisResult.filename}</span> •{' '}
                  {analysisResult.word_count} words analyzed
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-200 block">
                    Best Matching Role
                  </span>
                  <span className="text-base font-bold text-white">
                    {analysisResult.best_matching_role}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center">
                  {analysisResult.best_match_score}%
                </div>
              </div>
            </div>

            {/* Extracted Contact Info Snippets */}
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-4 text-xs text-indigo-200">
              {analysisResult.contact_info?.email && (
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <Mail className="w-3.5 h-3.5 text-indigo-300" />
                  <span>{analysisResult.contact_info.email}</span>
                </div>
              )}
              {analysisResult.contact_info?.phone && (
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <Phone className="w-3.5 h-3.5 text-indigo-300" />
                  <span>{analysisResult.contact_info.phone}</span>
                </div>
              )}
              {analysisResult.contact_info?.linkedin && (
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <Globe className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="truncate max-w-[200px]">{analysisResult.contact_info.linkedin}</span>
                </div>
              )}
              {analysisResult.contact_info?.github && (
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <Code className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="truncate max-w-[200px]">{analysisResult.contact_info.github}</span>
                </div>
              )}
            </div>
          </div>

          {/* Categorized Skills Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Extracted Technical Skills ({analysisResult.total_skills_count})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Extracted with NLP word boundary identification and categorized into industry domains.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(analysisResult.categorized_skills || {}).map(([catKey, skills]) => {
                const displayName = catKey.replace(/_/g, ' ').toUpperCase();
                return (
                  <div
                    key={catKey}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-indigo-100 transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black tracking-wider text-slate-700">
                        {displayName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-white rounded-full text-indigo-600 border border-slate-200">
                        {skills.length}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[40px]">
                      {skills.length > 0 ? (
                        skills.map((skill, sIdx) => (
                          <SkillBadge key={sIdx} name={skill} status="acquired" />
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">None detected</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resume Preview & Section Snippets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" /> Extracted Text Preview
              </h3>
              <p className="text-xs text-slate-600 font-mono bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {analysisResult.preview_text}
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" /> Experience & Education Snippets
              </h3>
              <div className="space-y-3">
                {analysisResult.sections?.experience ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-bold text-slate-800 block mb-1">Work Experience:</span>
                    <p className="text-slate-600 line-clamp-3 whitespace-pre-line">
                      {analysisResult.sections.experience}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-400 italic">
                    No explicit experience section heading identified.
                  </div>
                )}

                {analysisResult.sections?.education ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-bold text-slate-800 block mb-1">Education:</span>
                    <p className="text-slate-600 line-clamp-2 whitespace-pre-line">
                      {analysisResult.sections.education}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Recommended Job Roles Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Recommended Industry Career Roles
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ranked by hybrid TF-IDF cosine similarity and weighted required skills coverage.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysisResult.recommended_jobs?.map((job) => (
                <JobMatchCard
                  key={job.job_id}
                  job={job}
                  onSelectForGapAnalysis={handleSelectJobForGap}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
