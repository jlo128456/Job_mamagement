import React from 'react';

const checklistItems = [
  { id: 'noMissingScrews', label: 'No Missing Screws' },
  { id: 'testedOperation', label: 'Tested Operation' },
  { id: 'cleanedWorksite', label: 'Cleaned Worksite' },
  { id: 'reportedDefects', label: 'Reported Any Defects' },
];

const fields = [
  { name: 'customer_name', placeholder: 'Customer Name' },
  { name: 'contact_name', placeholder: 'Contact Name' },
  { name: 'travel_time', placeholder: 'Travel Time (hrs)', type: 'number' },
  { name: 'labour_hours', placeholder: 'Labour Hours', type: 'number' },
];

function UpdateJobForm({
  form,
  updateForm,
  updateCheck,
  onSubmit,
  onClose,
  canvasRef,
  start,
  move,
  setDrawing
}) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {fields.map(({ name, placeholder, type = 'text' }) => (
        <input
          key={name}
          type={type}
          name={name}
          value={form[name] || ''}
          placeholder={placeholder}
          onChange={e => updateForm(name, e.target.value)}
        />
      ))}

      <textarea
        name="work_performed"
        value={form.work_performed || ''}
        onChange={e => updateForm('work_performed', e.target.value)}
        placeholder="Work Performed"
        rows={4}
      />

      <select name="status" value={form.status || 'Pending'} onChange={e => updateForm('status', e.target.value)}>
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed - Pending Approval</option>
      </select>

      {checklistItems.map(({ id, label }) => (
        <label key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id={id}
            checked={form.checklist[id] || false}
            onChange={e => updateCheck(id, e.target.checked)}
          />
          {label}
        </label>
      ))}

      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={() => setDrawing(false)}
        style={{ border: '1px solid #ccc', margin: '0 auto' }}
      />

      <div className="button-row">
        <button type="submit" className="send-btn">Save</button>
        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

export default UpdateJobForm;
