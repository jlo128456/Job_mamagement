import React, { useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { formatForDisplayLocal } from '../utils/timeUtils';
import { moveJobToInProgress } from '../api/jobs';

function ContractorDashboard({ onLogout }) {
  const { user, jobs } = useContext(AppContext);

  const contractorJobs = jobs.filter(job => job.assigned_contractor === user.id);

  return (
    <div>
      <h2>Contractor Dashboard</h2>
      <button onClick={onLogout}>Logout</button>
      <table>
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
          {contractorJobs.map(job => (
            <tr key={job.id}>
              <td>{job.work_order}</td>
              <td>{job.customer_name}</td>
              <td>{formatForDisplayLocal(job.required_date)}</td>
              <td>{job.contractor_status || job.status}</td>
              <td>{formatForDisplayLocal(job.onsite_time)}</td>
              <td>
                {job.status === 'Pending' && (
                  <button onClick={() => moveJobToInProgress(job.id)}>Onsite</button>
                )}
                <button onClick={() => alert('Show update modal')}>Job Completed</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ContractorDashboard;