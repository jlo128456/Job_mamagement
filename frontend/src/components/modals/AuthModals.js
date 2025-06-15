import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
  

//  Forgot Password Modal
export function ForgotPasswordModal({ isOpen, onClose }) {
  const { API_BASE_URL } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send reset link');
      } else {
        setMessage('Reset link sent! Please check your email.');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box auth-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h3>Forgot Password</h3>
        <p>Enter your email to receive a reset link.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <div className="button-row">
            <button type="submit" className="send-btn">Send Link</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
        {message && <p className="success-msg">{message}</p>}
        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
}


//  Signup Modal
export function SignupModal({ isOpen, onSignup, onClose }) {
  const { API_BASE_URL } = useContext(AppContext);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        onSignup(data);      // pass user data back to parent
        onClose();           // close modal
      }
    } catch (err) {
      setError('Network error');
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box auth-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h3>Create New Account</h3>
        <form onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          {error && <p className="error-msg">{error}</p>}
          <div className="button-row">
            <button type="submit" className="send-btn">Create Account</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

//  Login Modal (screenshot-style layout)
export function LoginModal({ onLogin }) {
  const { API_BASE_URL } = useContext(AppContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill in both fields.');
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Login failed');
      else onLogin(data);
    } catch {
      setError('Network error');
    }
  };

  const handleSignup = newUser => { onLogin(newUser); setShowSignup(false); };

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
            <button className="link-button" onClick={() => setShowForgot(true)}>Forgot Password?</button> |{' '}
            <button className="link-button" onClick={() => setShowSignup(true)}>Register New User</button>
          </div>
        </div>
      </div>

      {showForgot && <ForgotPasswordModal isOpen={true} onClose={() => setShowForgot(false)} />}
      {showSignup && <SignupModal isOpen={true} onSignup={handleSignup} onClose={() => setShowSignup(false)} />}
    </>
  );
}