import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { formatForDisplayLocal } from "../utils/timeUtils";
import { updateJobStatus } from "../api/jobs";
import AdminReviewModal from "./AdminReviewModal";

const AdminDashboard = ({ onLogout }) => {
  const { jobs, setJobs } = useContext(AppContext);
  const [modalJob, setModalJob] = useState(null);

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      const updated = await updateJobStatus(jobId, newStatus);
      setJobs(prev => prev.map(job => (job.id === updated.id ? updated : job)));
      setModalJob(null); // close modal after update
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };

  return (
    <section className="dashboard-container">
      <h2>Admin Dashboard</h2>
      <button className="logout-btn" onClick={onLogout}>Logout</button>

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
                      <>
                        <button onClick={() => setModalJob(job)}>Review</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {modalJob && (
        <AdminReviewModal
          job={modalJob}
          onApprove={() => handleStatusUpdate(modalJob.id, "Approved")}
          onReject={() => handleStatusUpdate(modalJob.id, "Rejected")}
          onClose={() => setModalJob(null)}
        />
      )}
    </section>
  );
};

export default AdminDashboard;
