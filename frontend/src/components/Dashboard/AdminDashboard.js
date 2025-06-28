import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { updateJobStatus } from '../../api/jobs';
import AdminReviewModal from '../Dashboard/AdminReviewModal';
import CreateJobModal from '../modals/CreateJobModal';
import CompleteJobModal from '../Dashboard/CompleteJobsModal';
import JobTable from '../Dashboard/JobTable';

function AdminDashboard({ onLogout }) {
  const { jobs, users, restartPolling } = useContext(AppContext);
  const [modalJob, setModalJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);

  useEffect(() => {
    const visible = Array.isArray(jobs)
      ? jobs.filter(j => !dismissedIds.includes(j.id))
      : [];
    const sorted = [...visible].sort((a, b) =>
      parseInt(a.work_order.replace(/\D/g, '')) -
      parseInt(b.work_order.replace(/\D/g, ''))
    );
    setActiveJobs(sorted.filter(j => j.status !== 'Completed'));
  }, [jobs, dismissedIds]);

  useEffect(() => {
    restartPolling();
    const onStorage = e => {
      if (['jobUpdated', 'jobReload'].includes(e.key)) restartPolling();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [restartPolling]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateJobStatus(id, status);
      localStorage.setItem('jobUpdated', Date.now());
      setModalJob(null);
      restartPolling();
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
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div>
          <button className="create-btn" onClick={() => setShowCreateModal(true)}>Create Job</button>
          <button className="archived-toggle-btn" onClick={() => setShowCompletedModal(true)}>View Completed Jobs</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <JobTable jobs={activeJobs} users={users} onReviewClick={setModalJob} onDismiss={handleDismiss} />

      {modalJob && (
        <AdminReviewModal
          job={modalJob}
          onClose={() => setModalJob(null)}
          onApprove={id => handleStatusUpdate(id, 'Approved')}
          onReject={id => handleStatusUpdate(id, 'In Progress')}
        />
      )}
      {showCreateModal && (
        <CreateJobModal
          isOpen
          onClose={() => setShowCreateModal(false)}
          onJobCreated={() => {
            setDismissedIds([]);
            restartPolling();
          }}
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
