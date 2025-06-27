import React from "react";

function AdminReviewModal({ job, onClose, onApprove, onReject }) {
  if (!job) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Review Job: {job.work_order}</h3>

        <div className="modal-details">
          <p><strong>Customer:</strong> {job.customer_name || "N/A"}</p>
          <p><strong>Status:</strong> {job.status || "N/A"}</p>
          <p><strong>Role:</strong> {job.role || "N/A"}</p>
          <p><strong>Contractor:</strong> {job.contractor || "N/A"}</p>
          <p><strong>Work Required:</strong> {job.work_required || "Not Provided"}</p>

          <p><strong>Work Performed:</strong> {job.work_performed || "Not Provided"}</p>

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
