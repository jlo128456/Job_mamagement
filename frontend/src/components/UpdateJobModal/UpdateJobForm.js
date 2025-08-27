// UpdateJobForm.js
import React, { useEffect } from 'react';

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
  { name: 'labour_time',   placeholder: 'Labour Time (hrs)', type: 'number' },
];

function UpdateJobForm({
  form, updateForm, updateCheck, onSubmit, onClose,
  canvasRef, start, move, setDrawing,
}) {
  //  set enforced status once (no dependency on updateForm)
  useEffect(() => {
    if (form.status !== 'Completed - Pending Approval') {
      updateForm('status', 'Completed - Pending Approval');
    }
    if (form.contractor_status !== 'Completed') {
      updateForm('contractor_status', 'Completed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once when the form mounts

  return (
    <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      {fields.map(({ name, placeholder, type='text' }) => (
        <input
          key={name}
          type={type}
          name={name}
          value={form[name]||''}
          placeholder={placeholder}
          onChange={e=>updateForm(name, e.target.value)}
        />
      ))}

      <textarea
        name="work_performed"
        rows={4}
        placeholder="Work Performed"
        value={form.work_performed||''}
        onChange={e=>updateForm('work_performed', e.target.value)}
      />

      {/* enforced hidden fields */}
      <input type="hidden" name="status" value="Completed - Pending Approval" />
      <input type="hidden" name="contractor_status" value="Completed" />

      {/* compact 2x2 checklist */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 12px', alignItems:'center' }}>
        {checklistItems.map(({ id, label }) => (
          <label key={id} style={{ display:'flex', alignItems:'center', gap:8, fontSize:'.9rem' }}>
            <input
              type="checkbox"
              style={{ width:14, height:14 }}
              checked={form.checklist?.[id]||false}
              onChange={e=>updateCheck(id, e.target.checked)}
            />
            <span style={{ lineHeight:1.2 }}>{label}</span>
          </label>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={()=>setDrawing(false)}
        onMouseLeave={()=>setDrawing(false)}
        style={{ border:'1px solid #ccc', margin:'0 auto', touchAction:'none' }}
      />

      <div className="button-row">
        <button type="submit" className="send-btn">Save</button>
        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

export default UpdateJobForm;
