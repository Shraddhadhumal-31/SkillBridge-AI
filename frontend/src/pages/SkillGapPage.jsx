import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SkillBadge from '../components/SkillBadge';
import SkillGapChart from '../components/SkillGapChart';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  GitCompare,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Briefcase,
  HelpCircle,
  Milestone,
} from 'lucide-react';

export default function SkillGapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const roleParam = searchParams.get('role') || 'Python Developer';
  const [selectedRole, setSelectedRole] = useState(roleParam);
  const [jobList, setJobList] = useState([]);
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load available jobs for the dropdown
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setJobList(res.data);
      } catch (err) {
        console.error('Failed to load jobs list:', err);
      }
    };
    fetchJobs();
  }, []);

  // Fetch skill gap whenever selectedRole changes
  useEffect(() => {
    const runSkillGap = async () => {
      setLoading(true);
      setError(null);

      // Get user's skills from latest analysis if available, otherwise default sample
      let userSkills = [];
      const saved = sessionStorage.getItem('latest_analysis');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          userSkills = parsed.flat_skills || [];
        } catch (e) {}
      }

      // If no skills extracted yet, use a standard baseline set for interactive preview
      if (!userSkills.length) {
        userSkills = ['Python', 'Git', 'HTML5', 'CSS3', 'SQL'];
      }

      try {
        const res = await api.post('/skills/analyze', {
          skills: userSkills,
          job_id: selectedRole,
        });
        setGapData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to compute skill gap for this role.');
      } finally {
        setLoading(false);
      }
    };

    runSkillGap();
  }, [selectedRole]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    setSearchParams({ role: newRole });
  };

  const handleGenerateRoadmap = () => {
    if (!gapData) return;
    const missing = gapData.missing_skills.map((s) => s.name);
    const possessed = gapData.matched_skills.map((s) => s.name);

    navigate('/roadmap', {
      state: {
        targetRole: gapData.job_title,
        missingSkills: missing,
        possessedSkills: possessed,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header & Role Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            Comparative Skill Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Skill Gap Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Compare your acquired competencies with target job requirements to prioritize high-impact missing skills.
          </p>
        </div>

        {/* Role Selector Dropdown */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-600 ml-2" />
          <select
            value={selectedRole}
            onChange={handleRoleChange}
            className="text-xs font-bold text-slate-800 bg-transparent pr-4 py-1.5 focus:outline-none cursor-pointer"
          >
            {jobList.length > 0 ? (
              jobList.map((j) => (
                <option key={j.id} value={j.title}>
                  {j.title}
                </option>
              ))
            ) : (
              <option value={selectedRole}>{selectedRole}</option>
            )}
          </select>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner message="Calculating skill compatibility and identifying gap vectors..." />
      ) : gapData ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Score Banner */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 mb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Target Role
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  {gapData.job_title}
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  {gapData.description}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100/80 flex-shrink-0">
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-700 block">
                    {gapData.compatibility_percentage}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Weighted Match Score
                  </span>
                </div>
                <div className="h-10 w-px bg-indigo-200" />
                <div className="text-left text-xs">
                  <span className="font-bold text-slate-800 block">
                    {gapData.matched_required_count} / {gapData.total_required_skills}
                  </span>
                  <span className="text-[11px] text-slate-500">Skills Acquired</span>
                </div>
              </div>
            </div>

            {/* Recharts Visual Comparison */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Compatibility Breakdown & Distribution
              </h3>
              <SkillGapChart
                matchedCount={gapData.matched_required_count}
                missingCount={gapData.missing_required_count}
                partialCount={gapData.partial_related_skills?.length || 0}
                weightedCoverage={gapData.weighted_coverage_percentage}
              />
            </div>
          </div>

          {/* Detailed Skills Comparison Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Possessed Skills */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Acquired Skills ({gapData.matched_skills.length})
                </h3>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                You already demonstrate strong alignment in these key requirements:
              </p>

              <div className="flex flex-wrap gap-2">
                {gapData.matched_skills.map((s, idx) => (
                  <SkillBadge
                    key={idx}
                    name={s.name}
                    status="acquired"
                    importance={s.importance}
                  />
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-500" /> Missing Skills ({gapData.missing_skills.length})
                </h3>
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Prioritize these technical proficiencies to satisfy core job requirements:
              </p>

              <div className="flex flex-wrap gap-2">
                {gapData.missing_skills.length > 0 ? (
                  gapData.missing_skills.map((s, idx) => (
                    <SkillBadge
                      key={idx}
                      name={s.name}
                      status="missing"
                      importance={s.importance}
                    />
                  ))
                ) : (
                  <p className="text-xs text-emerald-600 font-semibold">
                    Congratulations! You satisfy all core technical skills for this role!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Partial & Transferable Skills Alert */}
          {gapData.partial_related_skills && gapData.partial_related_skills.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6">
              <div className="flex items-center gap-2 text-amber-900 font-bold mb-3 text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Transferable & Related Skills Detected</span>
              </div>
              <div className="space-y-2">
                {gapData.partial_related_skills.map((p, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-amber-100 text-xs text-slate-700">
                    {p.transfer_note}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Recommendations */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              AI Action Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gapData.recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 mb-2">
                    {rec.learning_type}
                  </span>
                  <h4 className="font-bold text-slate-900 mb-1">{rec.skill}</h4>
                  <p className="text-slate-600 leading-relaxed">{rec.action}</p>
                </div>
              ))}
            </div>

            {/* CTA to Generate Roadmap */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Ready to close this gap?
                </h4>
                <p className="text-xs text-slate-500">
                  Generate a structured weekly milestone roadmap with curated learning tutorials.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateRoadmap}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition cursor-pointer"
              >
                <Milestone className="w-4 h-4" />
                <span>Generate Personalized Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
