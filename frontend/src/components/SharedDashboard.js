import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import JobRow from './JobRow';
import UpdateJobModal from './UpdateJobModal/UpdateJobModal';

function SharedDashboard({ role, onLogout, onComplete }) {
  const { user, jobs, restartPolling, fetchJobs } = useContext(AppContext);
  const [activeJobId, setActiveJobId] = useState(null);

  useEffect(() => {
    restartPolling(); // Start polling ONCE
    const handleStorage = (e) => {
      if (e.key === 'jobUpdated') restartPolling(); // Cross-tab update
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [restartPolling]); // restartPolling is stable (useCallback)

  const filteredJobs = Array.isArray(jobs)
    ? jobs.filter(job =>
        role === 'contractor'
          ? job.assigned_contractor === user?.id
          : job.assigned_tech === user?.id
      )
    : [];

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
              <th>Logged Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr><td colSpan="6">No jobs found for this {role}.</td></tr>
            ) : (
              filteredJobs.map(job => (
                <JobRow
                  key={job.id}
                  job={job}
                  refreshJobs={() => fetchJobs(true)}
                  onComplete={onComplete}
                  onOpenModal={() => setActiveJobId(job.id)}
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
