<<<<<<< HEAD
import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { updateJobStatus } from "../../api/jobs";
import AdminReviewModal from "./AdminReviewModal";
import CreateJobModal from "../modals/CreateJobModal";
import JobTable from "./JobTable";
import CompleteJobModal from "./CompleteJobsModal";
=======
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import AdminReviewModal from '../Dashboard/AdminReviewModal';
import CreateJobModal from '../modals/CreateJobModal';
import CompleteJobModal from '../Dashboard/CompleteJobsModal';
import JobTable from '../Dashboard/JobTable';
>>>>>>> 8c8f752 (Update fronend files)

function AdminDashboard({ onLogout }) {
  const { jobs, users, restartPolling } = useContext(AppContext);
  const [modalJob, setModalJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
<<<<<<< HEAD
  const [dismissedIds, setDismissedIds] = useState([]);
=======
>>>>>>> 8c8f752 (Update fronend files)

  useEffect(() => {
    restartPolling();
    const onStorage = (e) => {
<<<<<<< HEAD
      if (["jobUpdated", "jobReload"].includes(e.key)) restartPolling();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [restartPolling]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateJobStatus(id, status);
      localStorage.setItem("jobUpdated", Date.now());
      setModalJob(null);
      restartPolling();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleDismiss = (id) => setDismissedIds([...dismissedIds, id]);

  const visible = Array.isArray(jobs) ? jobs.filter(j => !dismissedIds.includes(j.id)) : [];
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
=======
      if (['jobUpdated', 'jobReload'].includes(e.key)) restartPolling();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [restartPolling]);

  const sortedJobs = Array.isArray(jobs)
    ? [...jobs].sort((a, b) => {
        const aNum = parseInt(a.work_order.replace(/\D/g, ''), 10);
        const bNum = parseInt(b.work_order.replace(/\D/g, ''), 10);
        return aNum - bNum;
      })
    : [];

  return (
    <section className="dashboard-container">
      <JobTable
        jobs={sortedJobs}
        users={users}
        onReviewClick={setModalJob}
        onCreate={() => setShowCreateModal(true)}
        onCompleted={() => setShowCompletedModal(true)}
      />

>>>>>>> 8c8f752 (Update fronend files)
      {modalJob && (
        <AdminReviewModal job={modalJob} onClose={() => setModalJob(null)} />
      )}
      {showCreateModal && (
        <CreateJobModal isOpen onClose={() => setShowCreateModal(false)} />
      )}
      {showCompletedModal && (
<<<<<<< HEAD
        <CompleteJobModal
          jobs={completed}
          onDismiss={handleDismiss}
          onClose={() => setShowCompletedModal(false)}
        />
=======
        <CompleteJobModal isOpen onClose={() => setShowCompletedModal(false)} />
>>>>>>> 8c8f752 (Update fronend files)
      )}
    </section>
  );
}

export default AdminDashboard;
