import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { formatForDisplayLocal } from "../utils/timeUtils";
import { updateJobStatus } from "../api/jobs";
import AdminReviewModal from "./AdminReviewModal";
import CreateJobModal from "./modals/CreateJobModal"; // Correct path

const AdminDashboard = ({ onLogout }) => {
  const { jobs, setJobs } = useContext(AppContext);
  const [modalJob, setModalJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      const updated = await updateJobStatus(jobId, newStatus);
      setJobs(prev => prev.map(job => (job.id === updated.id ? updated : job)));
      setModalJob(null);
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };

  const openCreateModal = () => {
    console.log("✅ Create Job clicked");
    setShowCreateModal(true);
  };

  return (
    <section className="dashboard-container">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div>
          <button className="create-btn" onClick={openCreateModal}>
            + Create Job
          </button>
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
          {jobs.length === 0 ? (
            <tr><td colSpan="7">No jobs found</td></tr>
          ) : (
            jobs.map(job => {
              const showActions = job.status === "Completed - Pending Approval";
              const statusClass = job.status?.toLowerCase().replace(/\s/g, "-") || "na";

              return (
                <tr key={job.id}>
                  <td>{job.work_order || 'N/A'}</td>
                  <td>{job.customer_name || 'N/A'}</td>
                  <td>{job.contractor || 'N/A'}</td>
                  <td>{job.role || 'N/A'}</td>
                  <td className={`status-cell ${statusClass}`}>
                    {job.status || 'N/A'}
                  </td>
                  <td>{job.status_timestamp ? formatForDisplayLocal(job.status_timestamp) : 'Not Updated'}</td>
                  <td>
                    {showActions && (
                      <button onClick={() => setModalJob(job)}>Review</button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Admin Review Modal */}
      {modalJob && (
        <AdminReviewModal
          job={modalJob}
          onApprove={() => handleStatusUpdate(modalJob.id, "Approved")}
          onReject={() => handleStatusUpdate(modalJob.id, "Rejected")}
          onClose={() => setModalJob(null)}
        />
      )}

      {/* Create Job Modal */}
      {showCreateModal && (
        <CreateJobModal
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </section>
  );
};

export default AdminDashboard;
