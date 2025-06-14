import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';

function CreateJobModal({ isOpen, onClose }) {
  const { API_BASE_URL, jobs, setJobs } = useContext(AppContext);
  const [formData, setFormData] = useState({
    work_order: '',
    customer_name: '',
    customer_address: '',
    contractor: '',
    work_required: '',
    role: 'contractor'
  });

  // Generate next work_order ID when modal opens
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
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const newJob = await res.json();
      setJobs([...jobs, newJob]);
      onClose();
      setFormData({
        work_order: '',
        customer_name: '',
        customer_address: '',
        contractor: '',
        work_required: '',
        role: 'contractor'
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
        <button onClick={onClose} className="close-button">×</button>
        <form onSubmit={handleSubmit}>
          <input name="work_order" value={formData.work_order} readOnly />
          <input name="customer_name" value={formData.customer_name} onChange={handleChange} placeholder="Customer Name" required />
          <input name="customer_address" value={formData.customer_address} onChange={handleChange} placeholder="Customer Address" required />
          <input name="contractor" value={formData.contractor} onChange={handleChange} placeholder="Contractor" required />
          <input name="work_required" value={formData.work_required} onChange={handleChange} placeholder="Work Required" required />
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="contractor">Contractor</option>
            <option value="technician">Technician</option>
          </select>
          <button type="submit">Create Job</button>
        </form>
      </div>
    </div>
  );
}

export default CreateJobModal;
