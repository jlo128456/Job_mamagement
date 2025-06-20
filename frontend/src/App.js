import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import SharedDashboard from './components/SharedDashboard';
import  LoginModal from './components/modals/LoginModal';


function AppContent() {
  const { user, setUser, API_BASE_URL, setJobs } = useContext(AppContext);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  let intervalId;

  const fetchJobs = async () => {
    if (!navigator.onLine) {
      console.warn("⚠️ Offline — skipping job fetch");
      return;
    }

    try {
      console.log("🔁 Fetching from:", `${API_BASE_URL}/jobs`);
      const res = await fetch(`${API_BASE_URL}/jobs`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("❌ Polling error:", err.message);
    }
  };

  // Fetch once immediately
  fetchJobs();

  // Start polling
  intervalId = setInterval(fetchJobs, 10000); // 10s

  // Cleanup on unmount
  return () => clearInterval(intervalId);
}, [API_BASE_URL, setJobs]);

  const handleLogin = (user) => {
    if (user?.email && user?.role) {
      setUser(user);
      setRole(user.role);
      navigate(`/${user.role}`);
    } else {
      alert("Login failed");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setRole(null);
    navigate('/login');
  };

  const handleJobComplete = (id) => alert(`Job ${id} marked complete.`);

  return (
    <div
      className="app-container"
      style={{
        backgroundImage: "url('/img/mound2.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header />

      <main className="main-content" style={{ flex: 1, padding: '1rem' }}>
        <Routes>
          <Route path="/login" element={<LoginModal onLogin={handleLogin} />} />
          {user && role === 'admin' && <Route path="/admin" element={<AdminDashboard onLogout={handleLogout} />} />}
          {user && role === 'contractor' && (
            <Route path="/contractor" element={
              <SharedDashboard role="contractor" onLogout={handleLogout} onComplete={handleJobComplete} />
            } />
          )}
          {user && role === 'technician' && (
            <Route path="/technician" element={
              <SharedDashboard role="technician" onLogout={handleLogout} onComplete={handleJobComplete} />
            } />
          )}
          <Route path="*" element={<Navigate to={user ? `/${role}` : '/login'} />} />
        </Routes>
      </main>
      <Footer />
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
