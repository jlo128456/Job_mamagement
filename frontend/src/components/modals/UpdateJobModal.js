import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const checklistItems = [
  { id: 'noMissingScrews', label: 'No Missing Screws' },
  { id: 'testedOperation', label: 'Tested Operation' },
  { id: 'cleanedWorksite', label: 'Cleaned Worksite' },
  { id: 'reportedDefects', label: 'Reported Any Defects' },
];

function UpdateJobModal({ jobId, onClose }) {
  const { API_BASE_URL, userRole } = useContext(AppContext);
  const [job, setJob] = useState(null);
  const [form, setForm] = useState({ checklist: {} });
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
      const data = await res.json();
      setJob(data);
      setForm({ ...data, checklist: data.checklist || {} });
    })();
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [API_BASE_URL, jobId]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleCheck = e => setForm(prev => ({
    ...prev,
    checklist: { ...prev.checklist, [e.target.id]: e.target.checked }
  }));

  const submit = async e => {
    e.preventDefault();
    const signature = canvasRef.current.toDataURL();
    const updated = {
      ...form,
      status: userRole === 'contractor' && form.status === 'Completed' ? 'Completed - Pending Approval' : form.status,
      contractor_status: userRole === 'contractor' ? 'Completed' : form.status,
      signature,
    };
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    res.ok ? onClose() : alert('Update failed');
  };

  const drawStart = e => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setDrawing(true);
  };
  const drawMove = e => drawing && canvasRef.current.getContext('2d').lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY) && canvasRef.current.getContext('2d').stroke();
  const drawEnd = () => setDrawing(false);

  if (!job) return null;

  return (
    <div className="modal show">
      <div className="modal-box">
        <button className="close-button" onClick={onClose}>×</button>
        <h3>Update #{job.work_order}</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input name="customer_name" value={form.customer_name || ''} onChange={handleChange} placeholder="Customer Name" />
          <input name="contact_name" value={form.contact_name || ''} onChange={handleChange} placeholder="Contact Name" />
          <textarea name="work_performed" value={form.work_performed || ''} onChange={handleChange} placeholder="Work Performed" rows={4} />
          <select name="status" value={form.status || 'Pending'} onChange={handleChange}>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed - Pending Approval</option>
          </select>

          {checklistItems.map(({ id, label }) => (
            <label key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id={id} checked={form.checklist[id] || false} onChange={handleCheck} />
              {label}
            </label>
          ))}

          <canvas ref={canvasRef} width={300} height={100} onMouseDown={drawStart} onMouseMove={drawMove} onMouseUp={drawEnd}
            style={{ border: '1px solid #ccc', margin: '0 auto' }} />

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
