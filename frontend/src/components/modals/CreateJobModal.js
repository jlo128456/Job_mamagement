import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import CreateJobForm from './CreateJobForm';

function CreateJobModal({ isOpen, onClose }) {
  const { API_BASE_URL, jobs, setJobs, timezone } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [formData, setFormData] = useState({
    work_order: '', customer_name: '', customer_address: '', assigned_user_id: '',
    required_date: '', work_required: '', machines: ''
  });

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      fetch(`${API_BASE_URL}/users/staff`).then(res => res.ok && res.json()),
      fetch(`${API_BASE_URL}/machines`).then(res => res.ok && res.json())
    ]).then(([u, m]) => {
      if (u) setUsers(u);
      if (m) setMachines(m);
    });
  }, [isOpen, API_BASE_URL]);

  useEffect(() => {
    if (!isOpen) return;
    const prefix = 'JM';
    const last = jobs
      .map(j => j.work_order)
      .filter(id => id?.startsWith(prefix))
      .map(id => parseInt(id.replace(prefix, '')))
      .filter(n => !isNaN(n))
      .sort((a, b) => b - a)[0] || 10000;
    setFormData(f => ({ ...f, work_order: `${prefix}${last + 1}` }));
  }, [isOpen, jobs]);

  const handleChange = e =>
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const u = users.find(u => u.id === parseInt(formData.assigned_user_id));

    const payload = {
      work_order: formData.work_order,
      customer_name: formData.customer_name.trim(),
      customer_address: formData.customer_address.trim(),
      work_required: formData.work_required.trim(),
      contractor: u?.contractor || '',
      role: u?.role || '',
      status: 'Pending',
      machines: formData.machines || '',
      required_date: formData.required_date,
      timezone,
      assigned_contractor: u?.role === 'contractor' ? u.id : null,
      assigned_tech: u?.role === 'technician' ? u.id : null
    };

    console.log('📦 Job Payload:', payload);

    try {
      const res = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      const newJob = await res.json();
      setJobs(p => [...p, newJob]);
      onClose();
      setFormData({
        work_order: '', customer_name: '', customer_address: '',
        assigned_user_id: '', required_date: '', work_required: '', machines: ''
      });
    } catch {
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
