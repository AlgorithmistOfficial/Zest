import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import LandingPage from './LandingPage';
import About from './About';
import Syllabus from './Syllabus';
import Practice from './Practice';
import Leaderboard from './Leaderboard';
import Schedule from './Schedule';
import Auth from './Auth';
import Home from './Home';

// Helper to check for token
const isAuthenticated = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Redirects to /home if already logged in
const PublicRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/home" replace /> : children;
};

// Redirects to /auth if not logged in
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/auth" replace />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
        
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/syllabus" element={<ProtectedRoute><Syllabus /></ProtectedRoute>} />
        <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
