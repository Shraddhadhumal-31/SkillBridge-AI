import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import DashboardCard from '../components/DashboardCard';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  FileText,
  Sparkles,
  Award,
  TrendingUp,
  Upload,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/user/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your career intelligence..." />;
  }

  const categoryColors = ['#4f46e5', '#7c3aed', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#64748b'];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-indigo-900 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Skill Intelligence Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome back, {user?.full_name || 'Student'}! 👋
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-indigo-200 leading-relaxed">
            Targeting{' '}
            <span className="font-bold text-white underline decoration-indigo-400">
              {data?.target_role || 'Software Engineer'}
            </span>
            . Your resume skill profile is actively tracked and aligned with industry standards.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/analyzer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-indigo-50 shadow-sm transition"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Analyze New Resume</span>
            </Link>
            <Link
              to="/roadmap"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-700/60 text-white font-bold text-xs hover:bg-indigo-700 border border-indigo-400/30 transition"
            >
              <span>View Career Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Analyses"
          value={data?.total_analyses || 0}
          subtext="Documents processed"
          icon={FileText}
          color="indigo"
        />
        <StatCard
          title="Extracted Skills"
          value={data?.total_skills_extracted || 0}
          subtext="Across all categories"
          icon={Layers}
          color="purple"
        />
        <StatCard
          title="Best Matched Role"
          value={data?.best_matching_role || 'Not set'}
          subtext={`${data?.best_match_score || 0}% Compatibility`}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Avg Skill Match"
          value={`${data?.avg_match_percentage || 0}%`}
          subtext="Industry readiness"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Main Grid: Skills Distribution & Roadmap Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Category Distribution Chart */}
        <DashboardCard
          title="Acquired Skills Breakdown"
          subtitle="Distribution of identified technical skills across core domains"
          className="lg:col-span-2"
        >
          {data?.skill_category_distribution && data.skill_category_distribution.length > 0 ? (
            <div className="h-64 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.skill_category_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.skill_category_distribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={categoryColors[idx % categoryColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No Skill Telemetry Yet"
              description="Upload your resume in the analyzer to visualize your domain distribution."
              actionLabel="Upload Resume"
              onAction={() => navigate('/analyzer')}
            />
          )}
        </DashboardCard>

        {/* Roadmap Progress Card */}
        <DashboardCard
          title="Active Career Roadmap"
          subtitle={`Targeting ${data?.target_role || 'Engineering'}`}
          action={
            <Link to="/roadmap" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              Open Roadmap
            </Link>
          }
        >
          <div className="space-y-6 pt-2">
            <div>
              <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                <span className="font-semibold">Curriculum Completion</span>
                <span className="font-bold text-indigo-700">{data?.roadmap_progress || 0}%</span>
              </div>
              <ProgressBar value={data?.roadmap_progress || 0} max={100} showPercentage={false} color="indigo" size="lg" />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="block font-bold text-slate-800">
                  {data?.completed_milestones || 0} of {data?.total_milestones || 0}
                </span>
                <span className="text-[11px] text-slate-500">Weekly milestones completed</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/interview"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
              >
                <span>Take Mock Technical Test</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Recommended Career Roles & Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Roles */}
        <DashboardCard
          title="Recommended Career Roles"
          subtitle="Top matching jobs calculated dynamically by our AI engine"
          action={
            <Link to="/jobs" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              View All Roles
            </Link>
          }
        >
          {data?.recommended_roles && data.recommended_roles.length > 0 ? (
            <div className="space-y-3 pt-2">
              {data.recommended_roles.map((role, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(`/skill-gap?role=${encodeURIComponent(role.job_title)}`)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition">
                        {role.job_title}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {role.matched_count} matched • {role.missing_count} to learn
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-indigo-600">
                      {role.match_percentage}%
                    </span>
                    <span className="block text-[10px] text-slate-400">Match</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Recommendations Yet"
              description="Analyze a resume to receive tailored career recommendations."
              actionLabel="Analyze Resume"
              onAction={() => navigate('/analyzer')}
            />
          )}
        </DashboardCard>

        {/* Recent Resume Analyses */}
        <DashboardCard
          title="Recent Resume Analyses"
          subtitle="History of uploaded resumes and extracted benchmarks"
          action={
            <Link to="/profile" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              Full History
            </Link>
          }
        >
          {data?.recent_analyses && data.recent_analyses.length > 0 ? (
            <div className="space-y-3 pt-2">
              {data.recent_analyses.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate('/analyzer')}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                        {item.filename}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {item.skills_count} skills extracted • {item.best_role}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600">{item.match_score}%</span>
                    <span className="block text-[10px] text-slate-400">
                      {item.date ? new Date(item.date).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Upload History"
              description="Upload your first resume to start generating insights."
              actionLabel="Upload Now"
              onAction={() => navigate('/analyzer')}
            />
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
