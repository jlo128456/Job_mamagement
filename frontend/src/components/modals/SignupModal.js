import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

function SignupModal({ isOpen, onSignup, onClose }) {
  const { API_BASE_URL } = useContext(AppContext);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'contractor'
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      console.log('Signup status:', res.status);

      const data = await res.json();
      console.log('Signup response:', data);

      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        onSignup(data);
        onClose();
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box auth-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h3>Create New Account</h3>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="contractor">Contractor</option>
            <option value="technician">Technician</option>
            <option value="admin">Admin</option>
          </select>
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

export default SignupModal;
