import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import LayoutHeaderFooter from './components/layoutHeaderFooter';
import AdminDashboard from './components/AdminDashboard';
import SharedDashboard from './components/SharedDashboard';
import { LoginModal } from './components/modals/AuthModals';

function AppContent() {
  const { user, setUser, API_BASE_URL, setJobs, pollingInterval, setPollingInterval } = useContext(AppContext);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/jobs`);
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    fetchJobs();
    if (!pollingInterval) setPollingInterval(setInterval(fetchJobs, 10000));
    return () => pollingInterval && (clearInterval(pollingInterval), setPollingInterval(null));
  }, [API_BASE_URL, pollingInterval, setJobs, setPollingInterval]);

  const handleLogin = ({ email }) => {
    const roleMap = {
      'admin@example.com': 'admin',
      'contractor@example.com': 'contractor',
      'tech@example.com': 'technician'
    };
    if (roleMap[email]) {
      setUser({ id: '1', email }); setRole(roleMap[email]);
    } else alert("Login failed");
  };

  const handleLogout = () => { setUser(null); setRole(null); };
  const handleJobComplete = (id) => alert(`Job ${id} marked complete.`);

  return (
    <div style={{
      backgroundImage: "url('/img/mound2.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh'
    }}>
      <Router>
        {user && <LayoutHeaderFooter />}
        <Routes>
          <Route path="/login" element={<LoginModal onLogin={handleLogin} />} />
          {user && role === 'admin' && <Route path="/admin" element={<AdminDashboard onLogout={handleLogout} />} />}
          {user && role === 'contractor' && (
            <Route path="/contractor" element={<SharedDashboard role="contractor" onLogout={handleLogout} onComplete={handleJobComplete} />} />
          )}
          {user && role === 'technician' && (
            <Route path="/technician" element={<SharedDashboard role="technician" onLogout={handleLogout} onComplete={handleJobComplete} />} />
          )}
          <Route path="*" element={<Navigate to={user ? `/${role}` : '/login'} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default function App() {
  return <AppProvider><AppContent /></AppProvider>;
}
