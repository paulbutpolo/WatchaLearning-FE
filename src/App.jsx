import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Auth from './Auth/Auth';
import ProtectedRoute from './ProtectedRoute';
import Unauthorized from './shared/Unauthorized';
import NotFound from './shared/NotFound';
import Loader from './shared/Loader';
import Dashboard from './Dashboard/Dashboard';
import VideoManagement from './Video/VideoManagement';
import VideoUpload from './Video/VideoUpload';
import VideoTest from './Video/VideoTest';
import CourseManagement from './Course/CourseManagement';
import Learn from './Learn/Learn';
import LearnViewer from './Learn/LearnViewer';
import TrackerCourse from './Tracker/TrackerCourse';
import AccountsManager from './Account/AccountsManager';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<Auth setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin" />}>
          <Route path="/videotest" element={<VideoTest />} /> {/* Staging/Testing grounds of the bullmq transcode */}
          <Route path="/videoupload" element={<VideoUpload />} />
          <Route path="/videolist" element={<VideoManagement />} />
          <Route path="/courselist" element={<CourseManagement />} />
          <Route path="/tracker" element={<TrackerCourse />} />
          <Route path="/accounts" element={<AccountsManager />} />
        </Route>

        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/course/:id" element={<LearnViewer />} />
          {/* <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/course/:id/video/:videoId" element={<VideoPlayer />} /> */}
          {/* <Route path="/dashboard/:id" element={<LearningPathDetail />} /> */}
        </Route>

        {/* Default route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        {/* Fallback route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;