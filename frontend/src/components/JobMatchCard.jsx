import React from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Briefcase, Sparkles } from 'lucide-react';
import ProgressBar from './ProgressBar';
import SkillBadge from './SkillBadge';

export default function JobMatchCard({ job, onSelectForGapAnalysis }) {
  const matchPct = job.match_percentage || 0;
  const matchedSkills = job.matched_required_skills || [];
  const missingSkills = job.missing_required_skills || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                {job.category || 'Engineering'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1.5">{job.job_title}</h3>
          </div>

          <div className="text-right flex flex-col items-end">
            <span
              className={`text-xl font-extrabold ${
                matchPct >= 75
                  ? 'text-emerald-600'
                  : matchPct >= 50
                  ? 'text-indigo-600'
                  : 'text-amber-600'
              }`}
            >
              {matchPct}%
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Skill Alignment
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <ProgressBar value={matchPct} max={100} showPercentage={false} color="auto" size="sm" />
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Skills Matched vs Missing */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills ({matchedSkills.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.length > 0 ? (
                matchedSkills.slice(0, 4).map((s, idx) => (
                  <SkillBadge key={idx} name={typeof s === 'string' ? s : s.name} status="acquired" />
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No direct required skills matched yet</span>
              )}
              {matchedSkills.length > 4 && (
                <span className="text-xs font-medium text-slate-500 self-center">
                  +{matchedSkills.length - 4} more
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5 text-rose-700">
                <AlertCircle className="w-3.5 h-3.5" /> Missing Skills ({missingSkills.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.length > 0 ? (
                missingSkills.slice(0, 3).map((s, idx) => (
                  <SkillBadge
                    key={idx}
                    name={typeof s === 'string' ? s : s.name}
                    status="missing"
                    importance={typeof s === 'object' ? s.importance : undefined}
                  />
                ))
              ) : (
                <span className="text-xs text-emerald-600 font-medium">All core requirements met!</span>
              )}
              {missingSkills.length > 3 && (
                <span className="text-xs font-medium text-slate-500 self-center">
                  +{missingSkills.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Career Suitability */}
        {job.career_suitability_summary && (
          <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <span>{job.career_suitability_summary}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onSelectForGapAnalysis(job)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
        >
          <span>Detailed Skill Gap & Roadmap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
