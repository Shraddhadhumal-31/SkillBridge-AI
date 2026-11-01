import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import JobRecommendationPage from './pages/JobRecommendationPage';
import SkillGapPage from './pages/SkillGapPage';
import CareerRoadmapPage from './pages/CareerRoadmapPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import ProfileHistoryPage from './pages/ProfileHistoryPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Application Pages */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analyzer" element={<ResumeAnalyzerPage />} />
            <Route path="/jobs" element={<JobRecommendationPage />} />
            <Route path="/skill-gap" element={<SkillGapPage />} />
            <Route path="/roadmap" element={<CareerRoadmapPage />} />
            <Route path="/interview" element={<InterviewPrepPage />} />
            <Route path="/profile" element={<ProfileHistoryPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
