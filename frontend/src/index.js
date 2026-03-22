import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { io } from 'socket.io-client';
import LandingPage from './LandingPage';
import About from './About';
import Syllabus from './Syllabus';
import Practice from './Practice';
import Leaderboard from './Leaderboard';
import Schedule from './Schedule';
import Auth from './Auth';
import Home from './Home';
import Profile from './Profile';
import Analytics from './Analytics';

// Helper to check for token
const isAuthenticated = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Redirects to /home if already logged in
const PublicRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/home" replace /> : children;
};

// Component to handle user presence via WebSocket
const UserPresence = ({ children }) => {
  React.useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    if (token && user.email) {
      // Connect to the backend socket server
      const socket = io('https://Shreyansh6726-zest.hf.space', {
        auth: { token }
      });

      socket.on('connect', () => {
        // Emit user-online event to the server
        socket.emit('user-online', {
          name: user.name,
          email: user.email,
          id: user._id || user.id
        });
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  // Register Service Worker for Push Notifications
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[SW] Service Worker Registered', reg.scope))
        .catch(err => console.error('[SW] Service Worker Registration Failed', err));
    }
  }, []);

  return children;
};

// Redirects to /auth if not logged in
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? (
    <UserPresence>{children}</UserPresence>
  ) : (
    <Navigate to="/auth" replace />
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
        
        <Route path="/about" element={<About />} />

        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/syllabus" element={<ProtectedRoute><Syllabus /></ProtectedRoute>} />
        <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
