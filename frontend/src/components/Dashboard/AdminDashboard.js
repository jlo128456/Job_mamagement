import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { updateJobStatus } from "../../api/jobs";
import AdminReviewModal from "../Dashboard/AdminReviewModal";
import CreateJobModal from "../modals/CreateJobModal";
import JobTable from "../Dashboard/JobTable";
import CompleteJobModal from "../Dashboard/CompleteJobsModal";

const AdminDashboard = ({ onLogout }) => {
  const { jobs, users, restartPolling } = useContext(AppContext);
  const [modalJob, setModalJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);

  const [dismissedJobs, setDismissedJobs] = useState(() => {
    const stored = localStorage.getItem("dismissedJobs");
    return stored ? JSON.parse(stored) : [];
  });

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

  const handleDismiss = (jobId) => {
    const updated = [...dismissedJobs, jobId];
    setDismissedJobs(updated);
    localStorage.setItem("dismissedJobs", JSON.stringify(updated));
  };

  //  Show all jobs not dismissed — no filter by assignment
  const visibleJobs = Array.isArray(jobs)
    ? jobs.filter((j) => !dismissedJobs.includes(j.id))
    : [];

  const activeJobs = visibleJobs.filter((j) => j.status !== "Completed");
  const completedJobs = visibleJobs.filter((j) => j.status === "Completed");

  return (
    <section className="dashboard-container">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div>
          <button className="create-btn" onClick={() => setShowCreateModal(true)}>Create Job</button>
          <button className="archived-toggle-btn" onClick={() => setShowCompletedModal(true)}>View Completed Jobs</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <JobTable
        jobs={activeJobs}
        users={users}
        onReviewClick={setModalJob}
        onDismiss={handleDismiss}
      />

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

      {showCompletedModal && (
        <CompleteJobModal
          jobs={completedJobs}
          onDismiss={handleDismiss}
          onClose={() => setShowCompletedModal(false)}
        />
      )}
    </section>
  );
};

export default AdminDashboard;
