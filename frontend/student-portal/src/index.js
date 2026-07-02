import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import { io } from 'socket.io-client';
import LandingPage from './LandingPage';
import About from './About';
import Syllabus from './Syllabus';
import Practice from './Practice';
import Leaderboard from './Leaderboard';
import Schedule from './Schedule';
import Auth from './Auth';
import SelectBatch from './SelectBatch';
import Home from './Home';
import Profile from './Profile';
import Analytics from './Analytics';
import Test from './Test';
import { getAuthToken, getAuthUser, isPersistentSession } from './authStorage';

// Helper to check for token
const isAuthenticated = () => {
  return getAuthToken();
};

// Redirects to /home if already logged in
const PublicRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/home" replace /> : children;
};


// Component to handle user presence via WebSocket
const UserPresence = ({ children }) => {
  const location = useLocation();
  const socketRef = React.useRef(null);
  const token = getAuthToken();

  React.useEffect(() => {
    const isPersistent = isPersistentSession();
    const user = getAuthUser() || {};

    if (token && user.email) {
      // Connect to the backend socket server
      const backendUrl = process.env.REACT_APP_BACKEND_URL ;
      const socket = io(backendUrl, {
        auth: { token }
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log(`[Presence] Connected via ${isPersistent ? 'Persistent' : 'Temporary'} session.`);
        // Emit user-online event to the server
        socket.emit('user-online', {
          name: user.name,
          email: user.email,
          id: user._id || user.id,
          dp: user.dp || user.profilePic || null,
          batchId: user.batchId || (user.batch && user.batch._id) || null,
          batch: user.batch || null,
          isPersistent: isPersistent,
          location: window.location.pathname
        });
      });

      return () => {
        if (socket) {
          socket.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [token]); // Sync connection when token is available

  // Update location on route changes
  React.useEffect(() => {
    if (socketRef.current && socketRef.current.connected) {
      console.log(`[Presence] Navigation detected. Updating location to: ${location.pathname}`);
      socketRef.current.emit('page-view', { location: location.pathname });
    }
  }, [location.pathname]);

  return children;
};


// Redirects to /auth if not logged in
const ProtectedRoute = ({ children }) => {
  const [paramsHandled, setParamsHandled] = React.useState(false);
  const location = useLocation();

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

  const token = isAuthenticated();
  const storedUser = getAuthUser() || {};
  const hasBatch = !!storedUser.batchId || !!(storedUser.batch && storedUser.batch._id) || !!storedUser.batch?.id;

  if (token && !hasBatch && location.pathname !== '/select-batch') {
    return <Navigate to="/select-batch" replace />;
  }

  if (token && hasBatch && location.pathname === '/select-batch') {
    return <Navigate to="/home" replace />;
  }

  return isAuthenticated() ? (
    children
  ) : (
    <Navigate to="/auth" replace />
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <UserPresence>
          <Routes>
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />

            <Route path="/about" element={<About />} />

            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/select-batch" element={<ProtectedRoute><SelectBatch /></ProtectedRoute>} />
            <Route path="/syllabus" element={<ProtectedRoute><Syllabus /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/test/:testId" element={<ProtectedRoute><Test /></ProtectedRoute>} />
          </Routes>
        </UserPresence>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
