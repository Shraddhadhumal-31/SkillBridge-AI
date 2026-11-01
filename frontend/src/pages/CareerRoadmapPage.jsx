import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import RoadmapTimeline from '../components/RoadmapTimeline';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  Milestone,
  Sparkles,
  BookOpen,
  Clock,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export default function CareerRoadmapPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Read state passed from SkillGapPage or fetch active
  useEffect(() => {
    const initRoadmap = async () => {
      setLoading(true);
      setError(null);

      const navState = location.state;
      if (navState && navState.targetRole) {
        // Generate new custom roadmap for the selected target role
        try {
          const res = await api.post('/roadmap/generate', {
            target_role: navState.targetRole,
            missing_skills: navState.missingSkills || [],
            current_skills: navState.possessedSkills || [],
          });
          setRoadmap(res.data);
          setLoading(false);
          return;
        } catch (err) {
          console.error(err);
        }
      }

      // Otherwise fetch the active user roadmap from MongoDB
      try {
        const res = await api.get('/roadmap');
        setRoadmap(res.data);
      } catch (err) {
        console.error(err);
        // Fallback: generate default
        try {
          const genRes = await api.post('/roadmap/generate', {
            target_role: 'Python Developer',
            missing_skills: ['FastAPI', 'PostgreSQL', 'PyTest'],
            current_skills: ['Python', 'Git'],
          });
          setRoadmap(genRes.data);
        } catch (genErr) {
          setError('Failed to initialize career roadmap.');
        }
      } finally {
        setLoading(false);
      }
    };

    initRoadmap();
  }, [location.state]);

  const handleToggleMilestone = async (milestoneId, nextCompleted) => {
    if (!roadmap) return;
    setIsUpdating(true);
    try {
      const res = await api.put(`/roadmap/${roadmap.id}/progress`, {
        milestone_id: milestoneId,
        completed: nextCompleted,
      });
      setRoadmap(res.data);
    } catch (err) {
      console.error('Failed to update milestone progress:', err);
      setError('Could not save milestone status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Constructing your personalized learning roadmap..." />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-indigo-900 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-indigo-200 mb-2">
              <Milestone className="w-3.5 h-3.5" /> Structured Learning Path
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              {roadmap?.target_role || 'Developer'} Career Roadmap
            </h1>
            <p className="text-xs text-indigo-200 mt-1 max-w-xl">
              A personalized {roadmap?.total_weeks || 4}-week milestone curriculum designed to systematically close your technical gaps with free, industry-trusted educational resources.
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 w-full md:w-72 flex-shrink-0">
            <div className="flex justify-between items-center text-xs text-indigo-200 mb-1.5 font-semibold">
              <span>Overall Progress</span>
              <span className="font-bold text-white">{roadmap?.progress_percentage || 0}%</span>
            </div>
            <ProgressBar
              value={roadmap?.progress_percentage || 0}
              max={100}
              showPercentage={false}
              color="emerald"
              size="md"
            />
            <div className="mt-3 flex items-center justify-between text-[11px] text-indigo-200">
              <span>
                {roadmap?.completed_milestones || 0} of {roadmap?.total_milestones || 0} Weeks Completed
              </span>
              <span>~{roadmap?.total_estimated_hours || 0} Total Hours</span>
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Click any milestone checkmark to track your learning progress in MongoDB.</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/interview', { state: { roleId: roadmap?.target_role } })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Practice Mock Interview for this Role</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <RoadmapTimeline
          milestones={roadmap?.milestones || []}
          onToggleMilestone={handleToggleMilestone}
          isUpdating={isUpdating}
        />
      </div>
    </div>
  );
}
