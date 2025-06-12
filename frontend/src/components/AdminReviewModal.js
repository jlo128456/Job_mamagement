// src/components/AdminReviewModal.js
import React from "react";

function AdminReviewModal({ job, onClose, onApprove, onReject }) {
  if (!job) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Review Job: {job.work_order}</h3>
        <p><strong>Customer:</strong> {job.customer_name}</p>
        <p><strong>Status:</strong> {job.status}</p>
        <p><strong>Work Required:</strong> {job.work_required}</p>

        <div className="modal-actions">
          <button onClick={() => onApprove(job.id)}>Approve</button>
          <button onClick={() => onReject(job.id)}>Reject</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default AdminReviewModal;
