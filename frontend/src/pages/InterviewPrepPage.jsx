import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import InterviewQuestion from '../components/InterviewQuestion';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  HelpCircle,
  Briefcase,
  Sparkles,
  Award,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function InterviewPrepPage() {
  const location = useLocation();
  const initialRole = location.state?.roleId || 'Python Developer';

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [jobList, setJobList] = useState([]);
  const [difficulty, setDifficulty] = useState('All');
  const [quizSession, setQuizSession] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [question_id]: option_index }
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load available roles
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setJobList(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchJobs();
  }, []);

  const handleGenerateTest = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);
    setSelectedAnswers({});

    try {
      const res = await api.post('/interview/generate', {
        role_id: selectedRole,
        num_questions: 5,
        difficulty: difficulty,
      });
      setQuizSession(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate mock test session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate initial test on mount
  useEffect(() => {
    handleGenerateTest();
  }, [selectedRole, difficulty]);

  const handleSelectOption = (questionId, optionIndex) => {
    if (testResult) return; // Locked once submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitTest = async () => {
    if (!quizSession) return;
    const unansweredCount =
      quizSession.questions.length - Object.keys(selectedAnswers).length;

    if (unansweredCount > 0) {
      if (
        !window.confirm(
          `You have ${unansweredCount} unanswered questions. Submit anyway?`
        )
      ) {
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    const answersPayload = quizSession.questions.map((q) => ({
      question_id: q.question_id,
      selected_index:
        selectedAnswers[q.question_id] !== undefined
          ? selectedAnswers[q.question_id]
          : -1,
    }));

    try {
      const res = await api.post('/interview/submit', {
        session_id: quizSession.session_id,
        role_id: selectedRole,
        answers: answersPayload,
      });
      setTestResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to evaluate test submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = quizSession?.questions?.length || 0;

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            Technical Assessment Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            AI Mock Interview Preparation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Test your knowledge with targeted technical multiple-choice questions designed around your skill gaps. Review detailed explanations to reinforce understanding.
          </p>
        </div>

        {/* Role & Difficulty Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-indigo-600 ml-1.5" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={loading || isSubmitting}
              className="text-xs font-bold text-slate-800 bg-transparent pr-3 py-1 focus:outline-none cursor-pointer"
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

          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={loading || isSubmitting}
              className="text-xs font-bold text-slate-800 bg-transparent px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerateTest}
            disabled={loading}
            title="Generate new question set"
            className="p-2.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-2xl text-indigo-600 transition shadow-xs cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Result Score Card if submitted */}
      {testResult && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    testResult.score_percentage >= 80
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : testResult.score_percentage >= 60
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {testResult.rating}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                Test Performance Report
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                {testResult.summary}
              </p>
            </div>

            <div className="text-right flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-3xl font-black text-slate-900">
                  {testResult.score_percentage}%
                </span>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Score
                </span>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="text-left text-xs">
                <span className="font-bold text-emerald-600 block">
                  {testResult.correct_count} Correct
                </span>
                <span className="font-bold text-rose-600 block">
                  {testResult.incorrect_count} Incorrect
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleGenerateTest}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Take Another Test</span>
            </button>
          </div>
        </div>
      )}

      {/* Quiz Questions List */}
      {loading ? (
        <LoadingSpinner message="Selecting personalized technical questions..." />
      ) : quizSession?.questions?.length > 0 ? (
        <div className="space-y-4">
          {/* Progress Bar before submission */}
          {!testResult && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between gap-4">
              <div className="w-full max-w-md">
                <ProgressBar
                  value={answeredCount}
                  max={totalQuestions}
                  label={`Answered ${answeredCount} of ${totalQuestions} Questions`}
                  showPercentage={false}
                  color="indigo"
                  size="sm"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmitTest}
                disabled={isSubmitting || answeredCount === 0}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition cursor-pointer ${
                  answeredCount === 0
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200'
                }`}
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Test for Evaluation'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Render Questions */}
          {quizSession.questions.map((q) => {
            // Find breakdown item if test was submitted
            const itemResult = testResult?.breakdown?.find(
              (b) => b.question_id === q.question_id
            );

            return (
              <InterviewQuestion
                key={q.question_id}
                question={q}
                selectedIndex={selectedAnswers[q.question_id]}
                onSelectOption={(idx) => handleSelectOption(q.question_id, idx)}
                result={itemResult}
                disabled={Boolean(testResult)}
              />
            );
          })}

          {/* Bottom Submit CTA */}
          {!testResult && (
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleSubmitTest}
                disabled={isSubmitting || answeredCount === 0}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition cursor-pointer"
              >
                <span>Submit Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 text-sm">
          No questions available for this combination. Please choose another difficulty or role.
        </div>
      )}
    </div>
  );
}
