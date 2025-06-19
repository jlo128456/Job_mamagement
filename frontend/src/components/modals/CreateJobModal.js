import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';

function CreateJobModal({ isOpen, onClose }) {
  const { API_BASE_URL, jobs, setJobs } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    work_order: '',
    customer_name: '',
    customer_address: '',
    assigned_user_id: '',
    required_date: '', 
    work_required: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_BASE_URL}/users/staff`)
        .then(res => res.json())
        .then(setUsers)
        .catch(err => {
          console.error("Failed to load users:", err);
          setUsers([]);
        });
    }
  }, [isOpen, API_BASE_URL]);

  useEffect(() => {
    if (!isOpen) return;

    const prefix = 'JM';
    const lastNumber = jobs
      .map(j => j.work_order)
      .filter(id => id?.startsWith(prefix))
      .map(id => parseInt(id.replace(prefix, '')))
      .filter(n => !isNaN(n))
      .sort((a, b) => b - a)[0] || 10000;

    const nextOrder = `${prefix}${lastNumber + 1}`;
    setFormData(prev => ({ ...prev, work_order: nextOrder }));
  }, [isOpen, jobs]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const newJob = await res.json();
      setJobs([...jobs, newJob]);
      onClose();
      setFormData({
        work_order: '',
        customer_name: '',
        customer_address: '',
        assigned_user_id: '',
        work_required: '',
      });
    } catch (err) {
      console.error("Create job failed:", err);
      alert("Failed to create job.");
    }
  };

  if (!isOpen) return null;

  return (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <button className="close-button" onClick={onClose}>×</button>
      <form onSubmit={handleSubmit}>
        <input name="work_order" value={formData.work_order} readOnly />
        <input name="customer_name" placeholder="Customer Name" value={formData.customer_name} onChange={handleChange} required />
        <input name="customer_address" placeholder="Customer Address" value={formData.customer_address} onChange={handleChange} required />
        <select name="assigned_user_id" value={formData.assigned_user_id} onChange={handleChange} required>
          <option value="">Assign to user...</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.role} – {u.email}</option>
          ))}
        </select>
        <input name="work_required" placeholder="Work Required" value={formData.work_required} onChange={handleChange} required />
        <input type="date" name="required_date" value={formData.required_date} onChange={handleChange} required />
        <button type="submit">Create Job</button>
      </form>
    </div>
  </div>
);
}

export default CreateJobModal;
