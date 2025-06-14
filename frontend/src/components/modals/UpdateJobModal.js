import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

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

function UpdateJobModal({ jobId, onClose }) {
  const { API_BASE_URL, userRole } = useContext(AppContext);
  const [form, setForm] = useState({ checklist: {} });
  const [job, setJob] = useState(null);
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/jobs/${jobId}`)
      .then(res => res.json())
      .then(data => {
        setJob(data);
        setForm({ ...data, checklist: data.checklist || {} });
      });
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [API_BASE_URL, jobId]);

  const updateForm = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const updateCheck = (id, checked) =>
    setForm(f => ({ ...f, checklist: { ...f.checklist, [id]: checked } }));

  const handleSubmit = async e => {
    e.preventDefault();
    const signature = canvasRef.current.toDataURL();
    const payload = {
      ...form,
      signature,
      contractor_status: userRole === 'contractor' ? 'Completed' : form.status,
      status: userRole === 'contractor' && form.status === 'Completed'
        ? 'Completed - Pending Approval'
        : form.status,
    };
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    res.ok ? onClose() : alert('Update failed');
  };

  const start = e => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setDrawing(true);
  };

  const move = e => {
    if (drawing) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
    }
  };

  if (!job) return null;

  return (
    <div className="modal show">
      <div className="modal-box">
        <button className="close-button" onClick={onClose}>×</button>
        <h3>Update #{job.work_order}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
      </div>
    </div>
  );
}

export default UpdateJobModal;

