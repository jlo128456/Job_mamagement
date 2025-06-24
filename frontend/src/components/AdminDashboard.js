import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { formatForDisplayLocal } from "../utils/timeUtils";
import { updateJobStatus } from "../api/jobs";
import { getStatusClass } from "../utils/statusUtils";
import AdminReviewModal from "./AdminReviewModal";
import CreateJobModal from "./modals/CreateJobModal";

const AdminDashboard = ({ onLogout }) => {
  const { jobs, restartPolling } = useContext(AppContext);
  const [modalJob, setModalJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    restartPolling(); // Start polling on mount
  }, [restartPolling]);

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      await updateJobStatus(jobId, newStatus);
      restartPolling(); // Refresh after status change
      setModalJob(null);
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const jobList = Array.isArray(jobs) ? jobs : [];

  return (
    <section className="dashboard-container">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div>
          <button className="create-btn" onClick={() => setShowCreateModal(true)}>Create Job</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <table className="job-table">
        <thead>
          <tr>
            <th>Work Order</th>
            <th>Customer</th>
            <th>Contractor</th>
            <th>Role</th>
            <th>Status</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobList.length === 0 ? (
            <tr><td colSpan="7">No jobs found</td></tr>
          ) : jobList.map(job => {
            const showActions = job.status === "Completed - Pending Approval";
            const statusClass = getStatusClass(job.status);
            return (
              <tr key={job.id}>
                <td>{job.work_order || 'N/A'}</td>
                <td>{job.customer_name || 'N/A'}</td>
                <td>{job.contractor || 'N/A'}</td>
                <td>{job.role || 'N/A'}</td>
                <td className={`status-cell ${statusClass}`}>{job.status}</td>
                <td>{job.status_timestamp ? formatForDisplayLocal(job.status_timestamp) : 'Not Updated'}</td>
                <td>{showActions && <button onClick={() => setModalJob(job)}>Review</button>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {modalJob && (
        <AdminReviewModal
          job={modalJob}
          onApprove={(id) => handleStatusUpdate(id, "Completed")}
          onReject={(id) => handleStatusUpdate(id, "Pending")}
          onClose={() => setModalJob(null)}
        />
      )}

      {showCreateModal && (
        <CreateJobModal
          isOpen
          onClose={() => setShowCreateModal(false)}
          onJobCreated={restartPolling}
        />
      )}
    </section>
  );
};

export default AdminDashboard;

