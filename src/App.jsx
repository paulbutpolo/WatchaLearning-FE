import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Home from './Home/Home';
import Dashboard from './Dashboard/Dashboard';
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import React, { useEffect, useState } from 'react';
import Course from './Course/Course';
import CourseDetail from './Course/CourseDetail';
import VideoPlayer from './Course/VideoPlayer';
import LearningPathDetail from './Dashboard/LearningPathDetail'
import NotFound from './NotFound';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state

  // Check if the user is authenticated on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (token) {
      // Assume the token is valid (backend will verify it on protected routes)
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    setLoading(false); // Set loading to false after checking the token
  }, []);

  // Show a loading spinner or message while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/home" element={<Home />} />
          <Route path="/course" element={<Course />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/course/:id/video/:videoId" element={<VideoPlayer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:id" element={<LearningPathDetail />} />
        </Route>

        {/* Default route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
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