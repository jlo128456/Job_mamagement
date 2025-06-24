import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { updateJobStatus } from "../api/jobs";
import { formatForDisplayLocal } from "../utils/timeUtils";
import { getStatusClass } from "../utils/statusUtils";
import AdminReviewModal from "./AdminReviewModal";
import CreateJobModal from "./modals/CreateJobModal";

const AdminDashboard = ({ onLogout }) => {
  const { jobs, restartPolling } = useContext(AppContext);
  const [modalJob, setModalJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    restartPolling();
    const onStorage = (e) => e.key === "jobUpdated" && restartPolling();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [restartPolling]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateJobStatus(id, newStatus);
      localStorage.setItem("jobUpdated", Date.now());
      restartPolling();
      setModalJob(null);
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

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
            <th>Work Order</th><th>Customer</th><th>Contractor</th>
            <th>Role</th><th>Status</th><th>Updated</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(jobs) && jobs.length > 0 ? jobs.map(job => {
            const showBtn = job.status === "Completed - Pending Approval";
            return (
              <tr key={job.id}>
                <td>{job.work_order || 'N/A'}</td>
                <td>{job.customer_name || 'N/A'}</td>
                <td>{job.contractor || 'N/A'}</td>
                <td>{job.role || 'N/A'}</td>
                <td className={`status-cell ${getStatusClass(job.status)}`}>{job.status}</td>
                <td>{job.status_timestamp ? formatForDisplayLocal(job.status_timestamp) : 'Not Updated'}</td>
                <td>{showBtn && <button onClick={() => setModalJob(job)}>Review</button>}</td>
              </tr>
            );
          }) : <tr><td colSpan="7">No jobs found</td></tr>}
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
