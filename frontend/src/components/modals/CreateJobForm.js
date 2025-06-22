import React from 'react';

function CreateJobForm({ formData, users, machines, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      {['work_order', 'customer_name', 'customer_address'].map(name => (
        <input
          key={name}
          name={name}
          placeholder={name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          value={formData[name]}
          onChange={onChange}
          readOnly={name === 'work_order'}
          required={name !== 'work_order'}
        />
      ))}

      <select name="assigned_user_id" value={formData.assigned_user_id} onChange={onChange} required>
        <option value="">Assign to user...</option>
        {users.length > 0 ? users.map(u => (
          <option key={u.id} value={u.id}>
            {u.contractor || `${u.role.charAt(0).toUpperCase() + u.role.slice(1)}`}
          </option>
        )) : <option disabled>Loading users...</option>}
      </select>

      <input name="work_required" placeholder="Work Required" value={formData.work_required} onChange={onChange} required />
      <input type="date" name="required_date" value={formData.required_date} onChange={onChange} required />

      <select name="machines" value={formData.machines} onChange={onChange}>
        <option value="">Select a machine (optional)</option>
        {machines.length > 0 ? machines.map(m => (
          <option key={m.id} value={m.id}>
            {m.name || m.serial_number || `Machine ${m.id}`}
          </option>
        )) : <option disabled>Loading machines...</option>}
      </select>

      <button type="submit">Create Job</button>
    </form>
  );
}

export default CreateJobForm;
