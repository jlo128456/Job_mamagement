import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import SharedDashboard from './components/Dashboard/SharedDashboard';
import LoginModal from './components/modals/LoginModal';

function AppContent() {
  const { user, setUser } = useContext(AppContext);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

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
