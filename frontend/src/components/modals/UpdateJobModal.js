import React, { useState, useEffect } from 'react';

function UpdateJobModal({ job, onClose, onSave }) {
  const [formData, setFormData] = useState(job || {});

  useEffect(() => {
    setFormData(job);
  }, [job]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!job) return null;

  return (
    <div className="modal">
      <div className="modal-box">
        <h3>Update Job</h3>
        <form onSubmit={handleSubmit}>
          <input name="work_required" value={formData.work_required || ''} onChange={handleChange} placeholder="Work Required" />
          <input name="customer_address" value={formData.customer_address || ''} onChange={handleChange} placeholder="Customer Address" />
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default UpdateJobModal;