import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import JobRow from '../Dashboard/JobRow';
import UpdateJobModal from '../UpdateJobModal/UpdateJobModal';

function SharedDashboard({ role, onLogout, onComplete }) {
  const { user, jobs, fetchJobs } = useContext(AppContext);
  const [activeJobId, setActiveJobId] = useState(null);
  const [dismissedIds, setDismissedIds] = useState(() => {
    const stored = localStorage.getItem("dismissedJobs");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    fetchJobs(true);
  }, [fetchJobs]);

  const handleDismiss = (jobId) => {
    const updated = [...dismissedIds, jobId];
    setDismissedIds(updated);
    localStorage.setItem("dismissedJobs", JSON.stringify(updated));
  };

  const filteredJobs = Array.isArray(jobs)
    ? jobs.filter(job => {
        const isAssignedToUser =
          job.assigned_contractor === user?.id ||
          job.assigned_tech === user?.id;
        return isAssignedToUser && !dismissedIds.includes(job.id);
      })
    : [];

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const numA = parseInt(a.work_order?.replace(/\D/g, '') || 0);
    const numB = parseInt(b.work_order?.replace(/\D/g, '') || 0);
    return numA - numB;
  });

  return (
    <div className="dashboard-container">
      <h2>{role === 'contractor' ? 'Contractor' : 'Technician'} Dashboard</h2>
      <button className="logout-btn" onClick={onLogout}>Logout</button>

      <div className="table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Work Order</th>
              <th>Customer</th>
              <th>Required Date</th>
              <th>Status</th>
              <th>Onsite Time</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedJobs.length === 0 ? (
              <tr>
                <td colSpan="7">No jobs found for this {role}.</td>
              </tr>
            ) : (
              sortedJobs.map(job => (
                <JobRow
                  key={job.id}
                  job={job}
                  refreshJobs={() => fetchJobs(true)}
                  onComplete={onComplete}
                  onOpenModal={() => setActiveJobId(job.id)}
                  onDismiss={() => handleDismiss(job.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {activeJobId && (
        <UpdateJobModal
          jobId={activeJobId}
          onClose={() => {
            setActiveJobId(null);
            fetchJobs(true);
          }}
        />
      )}
    </div>
  );
}

export default SharedDashboard;
