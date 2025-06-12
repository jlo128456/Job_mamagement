import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import LayoutHeaderFooter from './components/layoutHeaderFooter';
import AdminDashboard from './components/AdminDashboard';
import SharedDashboard from './components/SharedDashboard';
import { LoginModal } from './components/modals/AuthModals';

function AppContent() {
  const { user, setUser, API_BASE_URL, setJobs, pollingInterval, setPollingInterval } = useContext(AppContext);
  const [role, setRole] = useState(null);
  const navigate = useNavigate(); //  needed for programmatic redirect

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

  const handleLogin = (user) => {
    if (user?.email && user?.role) {
      setUser(user);
      setRole(user.role);
      navigate(`/${user.role}`); //  redirect user based on their role
    } else {
      alert("Login failed");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setRole(null);
    navigate('/login'); // optional: return to login page after logout
  };

  const handleJobComplete = (id) => alert(`Job ${id} marked complete.`);

  return (
    <div style={{
      backgroundImage: "url('/img/mound2.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh'
    }}>
      <LayoutHeaderFooter show={!!user} />
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
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
