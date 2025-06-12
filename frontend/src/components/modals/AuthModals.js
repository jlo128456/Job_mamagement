import React, { useState } from 'react';
import { Link } from 'react-router-dom';
//  Forgot Password Modal
export function ForgotPasswordModal({ onSubmit }) {
  const [email, setEmail] = useState('');
  const handleSubmit = e => {
    e.preventDefault();
    if (onSubmit) onSubmit(email);
  };
  return (
    <div className="modal">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
}
//  Reset Password Modal
export function ResetPasswordModal({ onSubmit }) {
  const [password, setPassword] = useState('');
  const handleSubmit = e => {
    e.preventDefault();
    if (onSubmit) onSubmit(password);
  };
  return (
    <div className="modal">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}
//  Signup Modal
export function SignupModal({ onSignup }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = e => {
    e.preventDefault();
    if (onSignup) onSignup(form);
  };
  return (
    <div className="modal">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" required onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}
export function LoginModal({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = e => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill in both fields.');
    setError('');
    onLogin && onLogin(form);
  };

  return (
    <div className="login-overlay">
      <form id="loginForm" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <p className="login-subtitle">Please enter your credentials</p>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
        <div className="login-links">
          <Link to="/reset-password">Forgot Password?</Link>
          <span> | </span>
          <Link to="/register">Register New User</Link>
        </div>
      </form>
    </div>
  );
}
