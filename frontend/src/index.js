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

// Helper for Web Push
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Component to handle user presence via WebSocket
const UserPresence = ({ children }) => {
  React.useEffect(() => {
    const isPersistent = !!localStorage.getItem('token');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    if (token && user.email) {
      // Connect to the backend socket server
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';
      const socket = io(backendUrl, {
        auth: { token }
      });

      socket.on('connect', () => {
        console.log(`[Presence] Connected via ${isPersistent ? 'Persistent' : 'Temporary'} session.`);
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
        console.log(`[Notification] Triggering browser notification for "${data.examName}" at ${timeStr}`);
        new Notification("Zest Exam Reminder", {
          body: `Your exam "${data.examName}" starts in 10 minutes (at ${timeStr})!`,
          icon: "https://cdn-icons-png.flaticon.com/512/2103/2103633.png"
        });
      };

      socket.on('exam-reminder', (data) => {
        console.log(`[Reminder Received] Data:`, data);
        if (Notification.permission === "granted") {
          triggerNotification(data);
        } else if (Notification.permission !== "denied") {
          console.log("[Reminder] Requesting notification permission...");
          Notification.requestPermission().then(permission => {
            console.log(`[Reminder] Permission ${permission}`);
            if (permission === "granted") {
              triggerNotification(data);
            }
          });
        } else {
          console.error("[Reminder] Notifications are blocked by the browser settings.");
        }
      });

      // Background Web Push Registration for Persistent users
      if (isPersistent && 'serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/sw.js').then(function (registration) {
          console.log('[Web Push] Service Worker registered with scope:', registration.scope);

          const publicVapidKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'YOUR_PUBLIC_VAPID_KEY_HERE';
          console.log('[Web Push] Checking for VAPID key...', publicVapidKey === 'YOUR_PUBLIC_VAPID_KEY_HERE' ? 'NOT FOUND (using placeholder)' : 'FOUND');
          console.log(`[Web Push] Key value (first 10): ${publicVapidKey.substring(0, 10)}...`);

          if (publicVapidKey !== 'YOUR_PUBLIC_VAPID_KEY_HERE') {
            registration.pushManager.getSubscription().then(function (subscription) {
              if (subscription === null) {
                console.log('[Web Push] No subscription found, requesting push subscription...');
                registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                }).then(function (newSubscription) {
                  console.log('[Web Push] SUCCESS: Subscribed to push backend!');
                  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';
                  fetch(`${backendUrl}/api/notifications/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, subscription: newSubscription })
                  }).then(() => console.log('[Web Push] SUCCESS: Subscription details sent to server.'))
                    .catch(e => console.error('[Web Push] ERROR: Failed to send subscription to server', e));
                }).catch(err => console.error('[Web Push] ERROR: Failed to subscribe browser', err));
              } else {
                console.log('[Web Push] Active subscription found. Syncing with backend...');
                const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';
                fetch(`${backendUrl}/api/notifications/subscribe`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: user.email, subscription: subscription })
                }).then(() => console.log('[Web Push] SUCCESS: Subscription synced with server.'))
                  .catch(e => console.error('[Web Push] ERROR: Failed to sync subscription with server', e));
              }
            });
          } else {
            console.warn('[Web Push] WARNING: Registration skipped - VAPID public key not found in env.');
          }
            });
          }
        }).catch(err => console.error('[Web Push] Service Worker registration failed', err));
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
