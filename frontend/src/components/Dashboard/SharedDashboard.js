import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import JobRow from '../Dashboard/JobRow';
import UpdateJobModal from '../UpdateJobModal/UpdateJobModal';

function SharedDashboard({ role, onLogout, onComplete }) {
  const { user, jobs, fetchJobs } = useContext(AppContext);
  const [activeId, setActiveId] = useState(null);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    fetchJobs(true);
  }, [fetchJobs]);

  useEffect(() => {
    const onStorage = (e) => {
      if (['jobUpdated', 'jobReload'].includes(e.key)) fetchJobs(true);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [fetchJobs]);

  useEffect(() => {
    if (activeId === null) fetchJobs(true);
  }, [activeId, fetchJobs]);

  const handleDismiss = (id) => setDismissed((prev) => [...prev, id]);

  const filtered = Array.isArray(jobs)
    ? jobs
        .filter(
          (j) =>
            (j.assigned_contractor === user?.id ||
              j.assigned_tech === user?.id) &&
            !dismissed.includes(j.id)
        )
        .sort(
          (a, b) =>
            parseInt(a.work_order?.replace(/\D/g, '') || 0, 10) -
            parseInt(b.work_order?.replace(/\D/g, '') || 0, 10)
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
              <th>Work Order</th><th>Customer</th><th>Required Date</th>
              <th>Status</th><th>Onsite Time</th><th>Updated</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7">No jobs found for this {role}.</td></tr>
            ) : (
              filtered.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  refreshJobs={() => fetchJobs(true)}
                  onComplete={onComplete}
                  onOpenModal={() => setActiveId(job.id)}
                  onDismiss={() => handleDismiss(job.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      {activeId && (
        <UpdateJobModal
          jobId={activeId}
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  );
}

export default SharedDashboard;
