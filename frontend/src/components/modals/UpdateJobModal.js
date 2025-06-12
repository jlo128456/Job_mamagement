import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../context/AppContext';

function UpdateJobModal({ jobId, onClose }) {
  const { API_BASE_URL, userRole } = useContext(AppContext);
  const [job, setJob] = useState(null);
  const [form, setForm] = useState({ checklist: {} });
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    (async () => {
      const jobRes = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
      const jobData = await jobRes.json();
      setJob(jobData);
      setForm({ ...jobData, checklist: jobData.checklist || {} });
    })();
  }, [API_BASE_URL, jobId]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleCheck = e => setForm({ ...form, checklist: { ...form.checklist, [e.target.id]: e.target.checked } });

  const submit = async e => {
    e.preventDefault();
    const signature = canvasRef.current.toDataURL();
    const updated = {
      ...form,
      status: userRole === 'contractor' && form.status === 'Completed' ? 'Completed - Pending Approval' : form.status,
      contractor_status: userRole === 'contractor' ? 'Completed' : form.status,
      signature
    };
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    res.ok ? onClose() : alert('Update failed');
  };

  const startDraw = e => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath(); ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setDrawing(true);
  };
  const draw = e => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); ctx.stroke();
  };
  const stopDraw = () => setDrawing(false);

  if (!job) return null;

  return (
    <div className="modal"><div className="modal-box">
      <button onClick={onClose}>×</button>
      <h3>Update #{job.work_order}</h3>
      <form onSubmit={submit}>
        <input name="customer_name" value={form.customer_name} onChange={handleChange} />
        <input name="contact_name" value={form.contact_name} onChange={handleChange} />
        <textarea name="work_performed" value={form.work_performed} onChange={handleChange} />
        <select name="status" value={form.status} onChange={handleChange}>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed - Pending Approval</option>
        </select>
        <label>
          <input type="checkbox" id="noMissingScrews"
            checked={form.checklist.noMissingScrews || false}
            onChange={handleCheck} /> No Missing Screws
        </label>
        <canvas ref={canvasRef} width={300} height={100}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw}
          style={{ border: '1px solid #ccc' }} />
        <button type="submit">Save</button>
      </form>
    </div></div>
  );
}

export default UpdateJobModal;
