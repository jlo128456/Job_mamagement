import React from "react";
import { formatForDisplayLocal } from "../../utils/timeUtils";
import { getStatusClass } from "../../utils/statusUtils";

const CompletedJobsModal = ({ jobs, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Completed Jobs</h3>
        <button className="close-btn" onClick={onClose}>X</button>
        {jobs.length === 0 ? (
          <p>No completed jobs found.</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Work Order</th>
                <th>Customer</th>
                <th>Completed At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>{job.work_order}</td>
                  <td>{job.customer_name}</td>
                  <td>{formatForDisplayLocal(job.status_timestamp)}</td>
                  <td className={getStatusClass(job.status)}>{job.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CompletedJobsModal;
