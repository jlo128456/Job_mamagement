import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { updateJobStatus } from '../../api/jobs';
import AdminReviewModal from '../Dashboard/AdminReviewModal';
import CreateJobModal from '../modals/CreateJobModal';
import CompleteJobModal from '../Dashboard/CompleteJobsModal';
import JobTable from '../Dashboard/JobTable';
import { socket } from '../../socket-client'; // ⬅ NEW: WebSocket client (adjust path if needed)

function AdminDashboard({ onLogout }) {
  // Kept your context shape; we just won’t use restartPolling anymore
  const { jobs, users, restartPolling, fetchJobs } = useContext(AppContext);

  const [modalJob, setModalJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);

  // ⬇️ NEW: WebSocket subscriptions replace polling/storage “nudges”
  useEffect(() => {
    const onChange = () => {
      // If your context exposes fetchJobs, refresh the list on push
      if (typeof fetchJobs === 'function') fetchJobs(true);
    };
    try {
      socket.on('job:updated', onChange);
      socket.on('job:list:changed', onChange);
    } catch (e) {
      // socket may be undefined in some test environments — fail quietly
      console.warn('Socket not initialised yet:', e?.message || e);
    }
    return () => {
      try {
        socket.off('job:updated', onChange);
        socket.off('job:list:changed', onChange);
      } catch {}
    };
  }, [fetchJobs]);

  // … your other effects/state derivations remain the same
  // e.g. computing activeJobs from jobs, etc.
  // useEffect(() => { setActiveJobs(/* ... */) }, [jobs]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateJobStatus(id, status);
      setModalJob(null);
      //  REMOVED: restartPolling();  // no longer needed with sockets
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDismiss = id => setDismissedIds(p => [...p, id]);

  const completed = Array.isArray(jobs)
    ? jobs.filter(j => j.status === 'Completed' && !dismissedIds.includes(j.id))
    : [];

  return (
    <section className="dashboard-container">
      {/* … your header / actions toolbar (Create Job, Completed Jobs, Logout, etc.) … */}

      <JobTable
        jobs={activeJobs}
        users={users}
        onOpenModal={setModalJob}
        onStatusUpdate={handleStatusUpdate}
      />

      {showCreateModal && (
        <CreateJobModal onClose={() => setShowCreateModal(false)} />
      )}

      {modalJob && (
        <AdminReviewModal
          job={modalJob}
          onClose={() => setModalJob(null)}
          onApprove={(id) => handleStatusUpdate(id, 'Completed')} // example
        />
      )}

      {showCompletedModal && (
        <CompleteJobModal
          jobs={completed}
          onDismiss={handleDismiss}
          onClose={() => setShowCompletedModal(false)}
        />
      )}
    </section>
  );
}

export default AdminDashboard;
