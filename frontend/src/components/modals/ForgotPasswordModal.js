import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

function ForgotPasswordModal({ isOpen, onClose }) {
  const { API_BASE_URL } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async e => {
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
      if (!res.ok) setError(data.error || 'Failed to send reset link');
      else setMessage('Reset link sent! Please check your email.');
    } catch {
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

export default ForgotPasswordModal;
