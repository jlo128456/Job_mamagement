import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import UpdateJobForm from './UpdateJobForm';

function UpdateJobModal({ jobId, onClose }) {
  const { API_BASE_URL, userRole, restartPolling } = useContext(AppContext);
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
      status:
        userRole === 'contractor' && form.status === 'Completed'
          ? 'Completed - Pending Approval'
          : form.status,
    };
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      localStorage.setItem('jobUpdated', Date.now());
      restartPolling(); // Ensure admin dashboard refreshes
      onClose();
    } else {
      alert('Update failed');
    }
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

  const handleOverlayClick = (e) => {
    if (e.target.id === 'modalOverlay') onClose();
  };

  if (!job) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h3>Update #{job.work_order}</h3>
        <UpdateJobForm
          form={form}
          setForm={setForm}
          canvasRef={canvasRef}
          onSubmit={handleSubmit}
          onClose={onClose}
          updateForm={updateForm}
          updateCheck={updateCheck}
          drawing={drawing}
          setDrawing={setDrawing}
          start={start}
          move={move}
        />
      </div>
    </div>
  );
}

export default UpdateJobModal;
