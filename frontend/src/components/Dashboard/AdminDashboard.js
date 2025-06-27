import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { updateJobStatus } from "../../api/jobs";
import AdminReviewModal from "./AdminReviewModal";
import CreateJobModal from "../modals/CreateJobModal";
import JobTable from "./JobTable";
import CompleteJobModal from "./CompleteJobsModal";

const AdminDashboard = ({ onLogout }) => {
  const { jobs, users, restartPolling } = useContext(AppContext);
  const [modalJob, setModalJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [dismissedJobs, setDismissedJobs] = useState([]);

  useEffect(() => {
    restartPolling();
    const onStorage = (e) => {
      if (["jobUpdated", "jobReload"].includes(e.key)) restartPolling();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [restartPolling]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateJobStatus(id, status);
      localStorage.setItem("jobUpdated", Date.now());
      restartPolling();
      setModalJob(null);
    } catch {}
  };

  const handleDismiss = (id) => {
    setDismissedJobs((prev) => [...prev, id]);
  };

  const visible = Array.isArray(jobs) ? jobs.filter(j => !dismissedJobs.includes(j.id)) : [];
  const active = visible.filter(j => j.status !== "Completed");
  const completed = visible.filter(j => j.status === "Completed");

  return (
    <section className="dashboard-container">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div>
          <button onClick={() => setShowCreateModal(true)} className="create-btn">Create Job</button>
          <button onClick={() => setShowCompletedModal(true)} className="archived-toggle-btn">View Completed Jobs</button>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      <JobTable jobs={active} users={users} onReviewClick={setModalJob} onDismiss={handleDismiss} />
      {modalJob && <AdminReviewModal job={modalJob} onApprove={(id) => handleStatusUpdate(id, "Completed")} onReject={(id) => handleStatusUpdate(id, "Pending")} onClose={() => setModalJob(null)} />}
      {showCreateModal && <CreateJobModal isOpen onClose={() => setShowCreateModal(false)} onJobCreated={restartPolling} />}
      {showCompletedModal && <CompleteJobModal jobs={completed} onDismiss={handleDismiss} onClose={() => setShowCompletedModal(false)} />}
    </section>
  );
};

export default AdminDashboard;
