import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import JobMatchCard from '../components/JobMatchCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Briefcase, Search, Filter, Sparkles, Upload } from 'lucide-react';

export default function JobRecommendationPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // Check if there is latest analysis in sessionStorage to match against!
        const savedAnalysis = sessionStorage.getItem('latest_analysis');
        if (savedAnalysis) {
          const parsed = JSON.parse(savedAnalysis);
          if (parsed.recommended_jobs && parsed.recommended_jobs.length > 0) {
            setJobs(parsed.recommended_jobs);
            setLoading(false);
            return;
          }
        }

        // Otherwise fetch all standard job profiles
        const res = await api.get('/jobs');
        // Format them as job match items with 0% baseline
        const formatted = res.data.map((j) => ({
          job_id: j.id,
          job_title: j.title,
          category: j.category,
          description: j.description,
          match_percentage: 0,
          required_coverage_percentage: 0,
          matched_required_skills: [],
          missing_required_skills: j.required_skills,
          matched_optional_skills: [],
          missing_optional_skills: j.optional_skills.map((s) => s.name),
          explanation: 'Upload your resume to benchmark your personalized match score.',
          career_suitability_summary: j.career_suitability_summary,
        }));
        setJobs(formatted);
      } catch (err) {
        console.error(err);
        setError('Failed to load career role recommendations.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSelectJob = (job) => {
    navigate(`/skill-gap?role=${encodeURIComponent(job.job_title)}`);
  };

  const categories = ['All', ...new Set(jobs.map((j) => j.category).filter(Boolean))];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <LoadingSpinner message="Retrieving industry job recommendations..." />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            Industry Benchmarks
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Target Job Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Explore 8 standard industry developer and data career profiles. Compare required vs matched competencies and discover your best career path.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/analyzer')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition self-start sm:self-auto cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Resume for Custom Scores</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles or technologies..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <JobMatchCard
            key={job.job_id}
            job={job}
            onSelectForGapAnalysis={handleSelectJob}
          />
        ))}
      </div>
    </div>
  );
}
