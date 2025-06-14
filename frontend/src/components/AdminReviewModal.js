// src/components/AdminReviewModal.js
import React from "react";

function AdminReviewModal({ job, onClose, onApprove, onReject }) {
  if (!job) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Review Job: {job.work_order}</h3>

        <div className="modal-details">
          <p><strong>Customer:</strong> {job.customer_name}</p>
          <p><strong>Status:</strong> {job.status}</p>
          <p><strong>Role:</strong> {job.role}</p>
          <p><strong>Contractor:</strong> {job.contractor}</p>
          <p><strong>Work Required:</strong> {job.work_required}</p>
          {job.contractor_notes && (
            <p><strong>Contractor Notes:</strong> {job.contractor_notes}</p>
          )}
          {job.onsite_time && (
            <p><strong>Onsite Time:</strong> {new Date(job.onsite_time).toLocaleString()}</p>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={() => onApprove(job.id)} className="approve-btn">Approve Completion</button>
          <button onClick={() => onReject(job.id)} className="reject-btn">Reject</button>
          <button onClick={onClose} className="close-btn">Close</button>
        </div>
      </div>
    </div>
  );
}

export default AdminReviewModal;
