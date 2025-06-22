import React from 'react';

function CreateJobForm({ formData, users, machines, onChange, onSubmit }) {
  const handleTrim = e => {
    const { name, value } = e.target;
    onChange({ target: { name, value: value.trim() } });
  };

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="work_order">Work Order</label>
      <input
        name="work_order"
        value={formData.work_order}
        readOnly
        placeholder="Work Order Number"
        className="readonly-input"
      />

      <input
        name="customer_name"
        placeholder="Customer Name"
        value={formData.customer_name}
        onChange={onChange}
        onBlur={handleTrim}
        required
      />

      <input
        name="customer_address"
        placeholder="Customer Address"
        value={formData.customer_address}
        onChange={onChange}
        onBlur={handleTrim}
        required
      />

      <select
        name="assigned_user_id"
        value={formData.assigned_user_id}
        onChange={onChange}
        required
      >
        <option value="">Assign to user...</option>
        {users.map(u => (
          <option key={u.id} value={u.id}>
            {u.contractor || `${u.role.charAt(0).toUpperCase() + u.role.slice(1)}`}
          </option>
        ))}
      </select>

      <input
        name="work_required"
        placeholder="Work Required"
        value={formData.work_required}
        onChange={onChange}
        onBlur={handleTrim}
        required
      />

      <input
        type="date"
        name="required_date"
        value={formData.required_date}
        onChange={onChange}
        required
      />

      <select name="machines" value={formData.machines} onChange={onChange}>
        <option value="">Select a machine (optional)</option>
        {machines.map(m => (
          <option key={m.id} value={m.name}>
            {m.name} ({m.type || 'Unknown type'})
          </option>
        ))}
      </select>

      <button type="submit">Create Job</button>
    </form>
  );
}

export default CreateJobForm;
