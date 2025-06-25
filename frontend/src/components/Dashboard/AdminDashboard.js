import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { updateJobStatus } from "../../api/jobs";
import AdminReviewModal from "../Dashboard/AdminReviewModal";
import CreateJobModal from "../modals/CreateJobModal";
import JobTable from "../Dashboard/JobTable";

const AdminDashboard = ({ onLogout }) => {
  const { jobs, restartPolling } = useContext(AppContext);
  const [modalJob, setModalJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

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

  const now = new Date();
  const activeJobs = jobs.filter(j => 
    j.status !== "Completed" || 
    (j.status_timestamp && new Date(j.status_timestamp) > new Date(now.getTime() - 60 * 60 * 1000))
  );

  const archivedJobs = jobs.filter(j =>
    j.status === "Completed" && 
    j.status_timestamp && 
    new Date(j.status_timestamp) <= new Date(now.getTime() - 60 * 60 * 1000)
  );

  return (
    <section className="dashboard-container">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div>
          <button className="create-btn" onClick={() => setShowCreateModal(true)}>Create Job</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <JobTable jobs={activeJobs} onReviewClick={setModalJob} />

      {archivedJobs.length > 0 && (
        <div className="archived-section">
          <button className="archived-toggle-btn" onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? "Hide" : "Show"} Archived Jobs
          </button>
          {showArchived && <JobTable jobs={archivedJobs} onReviewClick={() => {}} />}
        </div>
      )}

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
