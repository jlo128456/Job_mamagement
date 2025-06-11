// placeholder for CreateJobModal.js// src/components/CreateJobModal.js
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { populateAdminJobs } from '../dashboard/admin'; // optional if needed

export default function CreateJobModal({ isOpen, onClose }) {
  const { API_BASE_URL, jobs, setJobs } = useContext(AppContext);

  const [formData, setFormData] = useState({
    work_order: '',
    customer_name: '',
    customer_address: '',
    contractor: '',
    work_required: '',
    role: 'contractor'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error(`Error creating job: ${response.status}`);
      const newJob = await response.json();
      setJobs([...jobs, newJob]);
      onClose(); // Close the modal
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
      alert("Failed to create job, see console.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="close-button">×</button>
        <form onSubmit={handleSubmit}>
          <input name="work_order" value={formData.work_order} onChange={handleChange} placeholder="Work Order" required />
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
