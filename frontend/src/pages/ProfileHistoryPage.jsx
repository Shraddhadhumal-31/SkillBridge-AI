import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  User,
  Mail,
  Briefcase,
  BookOpen,
  Calendar,
  FileText,
  Trash2,
  ExternalLink,
  Award,
  Sparkles,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function ProfileHistoryPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [targetRole, setTargetRole] = useState(user?.target_career_role || 'Python Developer');
  const [learningPrefs, setLearningPrefs] = useState(user?.learning_preferences || 'Hands-on projects with documentation');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [resumeHistory, setResumeHistory] = useState([]);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resumesRes, interviewRes] = await Promise.all([
          api.get('/resume/history'),
          api.get('/interview/history'),
        ]);
        setResumeHistory(resumesRes.data);
        setInterviewHistory(interviewRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch profile history.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await api.put('/user/profile', {
        full_name: fullName,
        target_career_role: targetRole,
        learning_preferences: learningPrefs,
      });
      setUser(res.data);
      localStorage.setItem('skillbridge_user', JSON.stringify(res.data));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAnalysis = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis record?')) return;
    try {
      await api.delete(`/resume/${id}`);
      setResumeHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert('Could not delete resume analysis.');
    }
  };

  const handleViewAnalysis = async (id) => {
    try {
      const res = await api.get(`/resume/${id}`);
      sessionStorage.setItem('latest_analysis', JSON.stringify(res.data));
      navigate('/analyzer');
    } catch (err) {
      console.error(err);
      alert('Could not open analysis record.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile data and historical logs..." />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
          Account & Trajectory
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          Profile & Assessment History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Manage your career target goals, review previous resume extractions, and inspect mock test milestones over time.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Profile Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-indigo-200">
              {fullName ? fullName.charAt(0) : 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{fullName || 'Student'}</h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Changes Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email Address (Account ID)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Target Career Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Python Developer"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Learning Preferences
            </label>
            <input
              type="text"
              value={learningPrefs}
              onChange={(e) => setLearningPrefs(e.target.value)}
              placeholder="e.g. Interactive projects and documentation"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Update Profile Preferences'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Resume Analysis History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Resume Analysis History ({resumeHistory.length})
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Access your past NLP extraction snapshots and recommendations.
        </p>

        {resumeHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5 font-bold">Document</th>
                  <th className="p-3.5 font-bold">Date</th>
                  <th className="p-3.5 font-bold">Extracted Skills</th>
                  <th className="p-3.5 font-bold">Best Matching Role</th>
                  <th className="p-3.5 font-bold">Match Score</th>
                  <th className="p-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resumeHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>{item.filename}</span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {item.analysis_date ? new Date(item.analysis_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                        {item.total_skills} skills
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      {item.best_matching_role || 'General'}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-600">
                      {item.best_match_score || 0}%
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleViewAnalysis(item.id)}
                        className="px-2.5 py-1 rounded-lg text-indigo-600 hover:bg-indigo-50 font-bold transition cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAnalysis(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed rounded-2xl">
            No past resume analyses recorded yet.
          </div>
        )}
      </div>

      {/* Mock Interview Test History */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Mock Interview Sessions History ({interviewHistory.length})
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Track historical assessment scores and performance across career domains.
        </p>

        {interviewHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5 font-bold">Role Tested</th>
                  <th className="p-3.5 font-bold">Date</th>
                  <th className="p-3.5 font-bold">Score</th>
                  <th className="p-3.5 font-bold">Rating</th>
                  <th className="p-3.5 font-bold">Correct / Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interviewHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span>{item.role_id}</span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3.5 font-black text-slate-900">
                      {item.score_percentage}%
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          item.score_percentage >= 80
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.score_percentage >= 60
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {item.rating}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {item.correct_count} of {item.total_questions} questions
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed rounded-2xl">
            No mock tests completed yet. Practice in the AI Interview Prep tab!
          </div>
        )}
      </div>
    </div>
  );
}
