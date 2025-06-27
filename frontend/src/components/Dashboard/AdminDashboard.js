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
  const [dismissedJobs, setDismissedJobs] = useState(() =>
    JSON.parse(localStorage.getItem("dismissedJobs") || "[]")
  );

  useEffect(() => {
    restartPolling();
    const onStorage = (e) => {
      if (["jobUpdated", "jobReload"].includes(e.key)) {
        if (e.key === "jobReload") {
          localStorage.removeItem("dismissedJobs");
          setDismissedJobs([]);
        }
        restartPolling();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [restartPolling]);

  useEffect(() => {
    if (!Array.isArray(jobs) || !jobs.length) return;
    const maxId = Math.max(...jobs.map(j => j.id));
    const stored = JSON.parse(localStorage.getItem("dismissedJobs") || "[]");
    if (stored.some(id => id > maxId)) {
      localStorage.removeItem("dismissedJobs");
      setDismissedJobs([]);
    }
  }, [jobs]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateJobStatus(id, status);
      localStorage.setItem("jobUpdated", Date.now());
      restartPolling();
      setModalJob(null);
    } catch {}
  };

  const handleDismiss = (id) => {
    const updated = [...dismissedJobs, id];
    setDismissedJobs(updated);
    localStorage.setItem("dismissedJobs", JSON.stringify(updated));
  };

  const visible = Array.isArray(jobs) ? jobs.filter(j => !dismissedJobs.includes(j.id)) : [];
  const active = visible.filter(j => j.status !== "Completed");
  const completed = visible.filter(j => j.status === "Completed");

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
      <JobTable jobs={active} users={users} onReviewClick={setModalJob} onDismiss={handleDismiss} />
      {modalJob && (
        <AdminReviewModal
          job={modalJob}
          onApprove={(id) => handleStatusUpdate(id, "Completed")}
          onReject={(id) => handleStatusUpdate(id, "Pending")}
          onClose={() => setModalJob(null)}
        />
      )}
      {showCreateModal && (
        <CreateJobModal isOpen onClose={() => setShowCreateModal(false)} onJobCreated={restartPolling} />
      )}
      {showCompletedModal && (
        <CompleteJobModal jobs={completed} onDismiss={handleDismiss} onClose={() => setShowCompletedModal(false)} />
      )}
    </section>
  );
};

export default AdminDashboard;
