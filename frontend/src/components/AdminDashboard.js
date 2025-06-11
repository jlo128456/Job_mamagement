import React, { useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { updateJobStatus } from '../api/jobs';
import { formatForDisplayLocal } from '../utils/timeUtils';

function AdminDashboard({ onLogout }) {
  const { jobs, setJobs } = useContext(AppContext);

  useEffect(() => {
    // jobs should be preloaded via context or parent
  }, []);

  const handleStatusUpdate = (jobId, status) => {
    updateJobStatus(jobId, status).then(updatedJob => {
      setJobs(prev =>
        prev.map(job => (job.id === updatedJob.id ? updatedJob : job))
      );
    });
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <button onClick={onLogout}>Logout</button>
      <table>
        <thead>
          <tr>
            <th>Work Order</th>
            <th>Customer</th>
            <th>Contractor</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id}>
              <td>{job.work_order || 'N/A'}</td>
              <td>{job.customer_name || 'N/A'}</td>
              <td>{job.contractor || 'N/A'}</td>
              <td>{job.role || 'N/A'}</td>
              <td className="status-cell">{job.status || 'N/A'}</td>
              <td className="last-updated">
                {job.status_timestamp
                  ? formatForDisplayLocal(job.status_timestamp)
                  : 'Not Updated'}
              </td>
              <td>
                {job.status === 'Completed - Pending Approval' && (
                  <>
                    <button onClick={() => handleStatusUpdate(job.id, 'Approved')}>
                      Approve
                    </button>
                    <button onClick={() => handleStatusUpdate(job.id, 'Rejected')}>
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;