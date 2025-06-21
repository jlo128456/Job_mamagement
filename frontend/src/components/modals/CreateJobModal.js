import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import CreateJobForm from './CreateJobForm';

function CreateJobModal({ isOpen, onClose }) {
  const { API_BASE_URL, jobs, setJobs, timezone, user } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [formData, setFormData] = useState({
    work_order: '', customer_name: '', customer_address: '', assigned_user_id: '',
    required_date: '', work_required: '', contractor: '',
    role: '', machines: ''
  });

  useEffect(() => {
    if (!isOpen) return;

    fetch(`${API_BASE_URL}/users/staff`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(setUsers)
      .catch(console.error);

    fetch(`${API_BASE_URL}/machines`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(setMachines)
      .catch(console.error);
  }, [isOpen, API_BASE_URL]);

  useEffect(() => {
    if (!isOpen) return;
    const prefix = 'JM';
    const last = jobs.map(j => j.work_order).filter(id => id?.startsWith(prefix))
      .map(id => parseInt(id.replace(prefix, ''))).filter(n => !isNaN(n)).sort((a, b) => b - a)[0] || 10000;
    setFormData(f => ({ ...f, work_order: `${prefix}${last + 1}` }));
  }, [isOpen, jobs]);

  const handleChange = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...formData,
      assigned_user_id: parseInt(formData.assigned_user_id) || null,
      machines: formData.machines || '',
      timezone
    };

    try {
      const res = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const newJob = await res.json();
      setJobs(p => [...p, newJob]);
      onClose();
      setFormData({
        work_order: '', customer_name: '', customer_address: '', assigned_user_id: '',
        required_date: '', work_required: '', contractor: user?.email || '', role: '', machines: ''
      });
    } catch (err) {
      alert("Failed to create job.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <CreateJobForm
          formData={formData}
          users={users}
          machines={machines}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default CreateJobModal;
