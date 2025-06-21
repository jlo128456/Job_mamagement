import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';

function CreateJobModal({ isOpen, onClose }) {
  const { API_BASE_URL, jobs, setJobs, timezone, user } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    work_order: '', customer_name: '', customer_address: '', assigned_user_id: '',
    required_date: '', work_required: '', contractor: user?.email || '',
    role: '', machines: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_BASE_URL}/users/staff`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(setUsers)
        .catch(err => console.error("Failed to load users:", err));
    }
  }, [isOpen, API_BASE_URL]);

  useEffect(() => {
    if (isOpen) {
      const prefix = 'JM';
      const last = jobs.map(j => j.work_order).filter(id => id?.startsWith(prefix))
        .map(id => parseInt(id.replace(prefix, ''))).filter(n => !isNaN(n)).sort((a, b) => b - a)[0] || 10000;
      setFormData(f => ({ ...f, work_order: `${prefix}${last + 1}` }));
    }
  }, [isOpen, jobs]);

  const handleChange = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      work_order: formData.work_order,
      customer_name: formData.customer_name,
      customer_address: formData.customer_address,
      assigned_user_id: parseInt(formData.assigned_user_id, 10),
      required_date: formData.required_date,
      work_required: formData.work_required,
      contractor: formData.contractor,
      role: formData.role,
      machines: formData.machines || '',
      timezone
    };

    console.log("📦 Final payload:", payload);

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
          {[
            { name: "work_order", readOnly: true },
            { name: "customer_name", placeholder: "Customer Name", required: true },
            { name: "customer_address", placeholder: "Customer Address", required: true }
          ].map(({ name, ...rest }) => (
            <input key={name} name={name} value={formData[name]} onChange={handleChange} {...rest} />
          ))}

          <select name="assigned_user_id" value={formData.assigned_user_id} onChange={handleChange} required>
            <option value="">Assign to user...</option>
            {users.length === 0
              ? <option disabled>Loading users or none available</option>
              : users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)} – {u.email}
                  </option>
                ))}
          </select>

          <input
            name="work_required"
            placeholder="Work Required"
            value={formData.work_required}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="required_date"
            value={formData.required_date}
            onChange={handleChange}
            required
          />

          <input
            name="contractor"
            placeholder="Contractor Name or Email"
            value={formData.contractor}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="contractor">Contractor</option>
            <option value="technician">Technician</option>
          </select>

          <input
            name="machines"
            placeholder="Machines Involved (optional)"
            value={formData.machines}
            onChange={handleChange}
          />

          <button type="submit">Create Job</button>
        </form>
      </div>
    </div>
  );
}

export default CreateJobModal;