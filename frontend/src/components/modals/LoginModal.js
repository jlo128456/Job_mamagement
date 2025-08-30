// src/components/modals/LoginModal.jsx
import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import SignupModal from './SignupModal';
import ForgotPasswordModal from './ForgotPasswordModal';

function LoginModal({ onLogin }) {
  const { API_BASE_URL } = useContext(AppContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // First try a "simple request" (x-www-form-urlencoded) to avoid CORS preflight.
  // If backend requires JSON (415), fall back to JSON.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill in both fields.');
    setError('');

    const url = `${API_BASE_URL}/users/login`;
    const formBody = new URLSearchParams(form); // browser sets Content-Type to application/x-www-form-urlencoded
    const jsonBody = JSON.stringify(form);

    try {
      let res = await fetch(url, { method: 'POST', credentials: 'include', body: formBody });
      if (res.status === 415) {
        res = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: jsonBody,
        });
      }
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json().catch(() => null) : null;
      if (!res.ok) return setError((data && (data.error || data.message)) || `Login failed (${res.status})`);
      onLogin(data || {});
    } catch {
      setError('Network/CORS error. Please try again.');
    }
  };

  const handleSignup = (newUser) => { onLogin(newUser); setShowSignup(false); };

  return (
    <>
      <div className="login-screen">
        <div className="login-card">
          <h1>Login</h1>
          <p className="login-subtitle">Please enter your credentials</p>
          <form onSubmit={handleSubmit}>
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required autoComplete="email" />
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required autoComplete="current-password" />
            <button type="submit" className="login-btn">Login</button>
            {error && <p className="error-msg">{error}</p>}
          </form>
          <div className="login-links">
            <button className="link-button" onClick={() => setShowForgot(true)}>Forgot Password?</button>{' '}
            <button className="link-button" onClick={() => setShowSignup(true)}>Register New User</button>
          </div>
        </div>
      </div>

      {showForgot && <ForgotPasswordModal isOpen={showForgot} onClose={() => setShowForgot(false)} />}
      {showSignup && <SignupModal isOpen={showSignup} onSignup={handleSignup} onClose={() => setShowSignup(false)} />}
    </>
  );
}

export default LoginModal;
