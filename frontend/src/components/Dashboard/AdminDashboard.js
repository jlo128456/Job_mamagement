import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { updateJobStatus } from '../../api/jobs';
import AdminReviewModal from '../Dashboard/AdminReviewModal';
import CreateJobModal from '../modals/CreateJobModal';
import CompleteJobModal from '../Dashboard/CompleteJobsModal';
import JobTable from '../Dashboard/JobTable';
import { socket } from '../../socket-client';
import HoursVsOnsiteChart from '../charts/HoursVsonsitChart'; // new chart feature

function AdminDashboard({ onLogout }) {
  const { jobs, users, fetchJobs } = useContext(AppContext);
  const [modalJob, setModalJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);

  useEffect(() => {
    const list = (Array.isArray(jobs) ? jobs : []).filter(j => !dismissedIds.includes(j.id));
    const num = x => parseInt(String(x || '').replace(/\D/g, ''), 10) || 0;
    setActiveJobs(list.sort((a, b) => num(a.work_order) - num(b.work_order)).filter(j => j.status !== 'Completed'));
  }, [jobs, dismissedIds]);

  useEffect(() => {
    fetchJobs?.(true);
    const onChange = () => fetchJobs?.(true);
    socket.on('job:updated', onChange);
    socket.on('job:list:changed', onChange);
    return () => {
      socket.off('job:updated', onChange);
      socket.off('job:list:changed', onChange);
    };
  }, [fetchJobs]);

  const handleStatusUpdate = async (id, status) => {
    try { await updateJobStatus(id, status); setModalJob(null); }
    catch (err) { console.error('Update failed:', err); }
  };

  const handleDismiss = id => setDismissedIds(p => [...p, id]);
  const completed = (Array.isArray(jobs) ? jobs : []).filter(j => j.status === 'Completed' && !dismissedIds.includes(j.id));

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
          onClose={() => setModalJob(null)}
          onApprove={id => handleStatusUpdate(id, 'Approved')}
          onReject={id => handleStatusUpdate(id, 'In Progress')}
        />
      )}

      {showCreateModal && (
        <CreateJobModal
          isOpen
          onClose={() => setShowCreateModal(false)}
          onJobCreated={() => { setDismissedIds([]); fetchJobs?.(true); }}
        />
      )}

      {showCompletedModal && (
        <CompleteJobModal
          jobs={completed}
          onDismiss={handleDismiss}
          onClose={() => setShowCompletedModal(false)}
        />
      )}

      {/* Chart at the bottom */}
      <HoursVsOnsiteChart jobs={jobs} users={users} />
    </section>
  );
}

export default AdminDashboard;
