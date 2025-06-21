import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

function SignupModal({ isOpen, onSignup, onClose }) {
  const { API_BASE_URL } = useContext(AppContext);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: 'contractor', contractor: ''
  });
  const [error, setError] = useState('');
  if (!isOpen) return null;

  const handleChange = e =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Registration failed');
      else {
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
          {[
            { name: 'name', type: 'text', placeholder: 'Full Name' },
            { name: 'email', type: 'email', placeholder: 'Email Address' },
            { name: 'password', type: 'password', placeholder: 'Password' }
          ].map(({ name, type, placeholder }) => (
            <input key={name} name={name} type={type} placeholder={placeholder}
              value={form[name]} onChange={handleChange} required />
          ))}

          <select name="role" value={form.role} onChange={handleChange}>
            {['contractor', 'technician', 'admin'].map(r => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>

          <input
            name="contractor"
            placeholder="Contractor Name"
            value={form.contractor}
            onChange={handleChange}
            required={['contractor', 'technician'].includes(form.role)}
          />

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
