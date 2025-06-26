import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import JobRow from '../Dashboard/JobRow';
import UpdateJobModal from '../UpdateJobModal/UpdateJobModal';

function SharedDashboard({ role, onLogout, onComplete }) {
  const { user, jobs, fetchJobs } = useContext(AppContext);
  const [activeJobId, setActiveJobId] = useState(null);
  const [dismissedIds, setDismissedIds] = useState([]);

  useEffect(() => {
    fetchJobs(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredJobs = Array.isArray(jobs)
    ? jobs.filter(job => {
        const isAssigned =
          role === 'contractor'
            ? job.assigned_contractor === user?.id
            : job.assigned_tech === user?.id;

        const isDismissed = dismissedIds.includes(job.id);
        return isAssigned && !isDismissed;
      })
    : [];

  const handleDismiss = (jobId) => {
    setDismissedIds(prev => [...prev, jobId]);
  };

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
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan="7">No jobs found for this {role}.</td>
              </tr>
            ) : (
              filteredJobs.map(job => (
                <JobRow
                  key={job.id}
                  job={job}
                  refreshJobs={() => fetchJobs(true)}
                  onComplete={onComplete}
                  onOpenModal={() => setActiveJobId(job.id)}
                  onDismiss={() => handleDismiss(job.id)} // pass dismiss callback
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
