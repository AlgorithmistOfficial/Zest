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
    const isPersistent = !!localStorage.getItem('token');
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
          id: user._id || user.id,
          dp: user.dp || user.profilePic || null,
          isPersistent: isPersistent
        });
      });

      // Handle Exam Reminders
      const triggerNotification = (data) => {
        const timeStr = new Date(data.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        new Notification("Zest Exam Reminder", {
          body: `Your exam "${data.examName}" starts in 10 minutes (at ${timeStr})!`,
          icon: "https://cdn-icons-png.flaticon.com/512/2103/2103633.png"
        });
      };

      socket.on('exam-reminder', (data) => {
        if (Notification.permission === "granted") {
          triggerNotification(data);
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              triggerNotification(data);
            }
          });
        }
      });

      // Request permission on mount if persistent and not set
      if (isPersistent && Notification.permission === "default") {
        Notification.requestPermission();
      }

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  return children;
};

// Redirects to /auth if not logged in
const ProtectedRoute = ({ children }) => {
  const [paramsHandled, setParamsHandled] = React.useState(false);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    const remember = urlParams.get('remember') === 'true';

    if (token && user) {
      const storage = remember ? localStorage : sessionStorage;
      
      // Clear both first to avoid stale data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      storage.setItem('token', token);
      storage.setItem('user', decodeURIComponent(user));
      
      // Remove params from URL to keep it clean
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setParamsHandled(true);
  }, []);

  if (!paramsHandled) return null;

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
