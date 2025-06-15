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

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill in both fields.');
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Login failed');
      else onLogin(data);
    } catch {
      setError('Network error');
    }
  };

  const handleSignup = newUser => {
    onLogin(newUser);
    setShowSignup(false);
  };

  return (
    <>
      <div className="login-screen">
        <div className="login-card">
          <h1>Login</h1>
          <p className="login-subtitle">Please enter your credentials</p>
          <form onSubmit={handleSubmit}>
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
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
