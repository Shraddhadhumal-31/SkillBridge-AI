import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import SkillBadge from './SkillBadge';

export default function RoadmapTimeline({ milestones = [], onToggleMilestone, isUpdating }) {
  if (!milestones.length) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No milestones generated yet. Select a career role to create your roadmap.
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-100">
      {milestones.map((ms, index) => {
        const isDone = ms.completed;

        return (
          <div key={ms.milestone_id || index} className="relative group">
            {/* Timeline Marker Icon */}
            <button
              type="button"
              onClick={() => onToggleMilestone(ms.milestone_id, !isDone)}
              disabled={isUpdating}
              title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
              className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isDone
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                  : 'bg-white border-2 border-indigo-400 text-indigo-600 hover:border-indigo-600 hover:scale-110'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <span className="text-xs font-bold">{ms.week}</span>
              )}
            </button>

            {/* Milestone Card */}
            <div
              className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                isDone
                  ? 'bg-emerald-50/20 border-emerald-200/60 shadow-xs'
                  : 'bg-white border-slate-200/80 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Week {ms.week}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      ms.difficulty === 'Beginner'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : ms.difficulty === 'Advanced'
                        ? 'bg-purple-50 text-purple-700 border-purple-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}
                  >
                    {ms.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    ~{ms.estimated_hours} Hours
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleMilestone(ms.milestone_id, !isDone)}
                    disabled={isUpdating}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                  >
                    {isDone ? 'Completed ✓' : 'Mark Completed'}
                  </button>
                </div>
              </div>

              {/* Title & Objective */}
              <h4
                className={`text-base font-bold mt-2.5 ${
                  isDone ? 'text-slate-700 line-through' : 'text-slate-900'
                }`}
              >
                {ms.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ms.objective}</p>

              {/* Targeted Skills */}
              {ms.skills && ms.skills.length > 0 && (
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {ms.skills.map((sk, idx) => (
                    <SkillBadge key={idx} name={sk} status={isDone ? 'acquired' : 'default'} />
                  ))}
                </div>
              )}

              {/* Action Checklist */}
              {ms.action_items && ms.action_items.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Action Checklist
                  </h5>
                  <ul className="space-y-1.5">
                    {ms.action_items.map((act, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-2 text-xs text-slate-700">
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Curated Resources */}
              {ms.resources && ms.resources.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Curated Learning Resources
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ms.resources.map((res, rIdx) => (
                      <a
                        key={rIdx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 hover:border-indigo-200 transition group/link text-xs"
                      >
                        <div className="overflow-hidden pr-2">
                          <p className="font-semibold text-slate-800 truncate group-hover/link:text-indigo-700">
                            {res.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {res.provider} • {res.type}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-indigo-600 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
