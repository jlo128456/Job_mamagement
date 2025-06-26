import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { updateJobStatus } from "../../api/jobs";
import AdminReviewModal from "../Dashboard/AdminReviewModal";
import CreateJobModal from "../modals/CreateJobModal";
import JobTable from "../Dashboard/JobTable";
import CompleteJobModal from "../Dashboard/CompleteJobsModal"; // new modal

const AdminDashboard = ({ onLogout }) => {
  const { jobs, restartPolling } = useContext(AppContext);
  const [modalJob, setModalJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);

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

  const completedJobs = jobs.filter(j =>
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
          <button className="archived-toggle-btn" onClick={() => setShowCompletedModal(true)}>View Completed Jobs</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <JobTable jobs={activeJobs} onReviewClick={setModalJob} />

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
          onClose={() => setShowCompletedModal(false)}
        />
      )}
    </section>
  );
};

export default AdminDashboard;
