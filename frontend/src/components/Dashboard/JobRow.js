import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { formatForDisplayLocal } from '../../utils/timeUtils';
import { moveJobToInProgress } from '../../api/jobs';
import { getStatusClass } from '../../utils/statusUtils';

function JobRow({ job, refreshJobs, onOpenModal }) {
  const { user, restartPolling } = useContext(AppContext);

  const requiredDate = job?.required_date
    ? formatForDisplayLocal(job.required_date)
    : 'N/A';

  const onsiteTime = job?.onsite_time
    ? formatForDisplayLocal(job.onsite_time)
    : 'Not Logged';

  const updatedTime = job?.status_timestamp
    ? formatForDisplayLocal(job.status_timestamp)
    : 'Not Updated';

  const rawStatus = job?.contractor_status || job?.status || 'Unknown';
  const displayStatus =
    rawStatus === 'Approved' &&
    (user?.role === 'contractor' || user?.role === 'technician')
      ? 'Completed'
      : rawStatus;

  const statusClass = `status-cell ${getStatusClass(displayStatus)}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.customer_address || '')}`;

  const handleOnsite = async () => {
    try {
      await moveJobToInProgress(job.id);
      localStorage.setItem('jobUpdated', Date.now());
      restartPolling();
      refreshJobs?.();
    } catch (e) {
      console.error('Failed to move job to In Progress', e);
    }
  };

  const handleCompletedClick = () => {
    localStorage.setItem('jobUpdated', Date.now());
    restartPolling();
    onOpenModal();
  };

  return (
    <tr>
      <td
        style={{ cursor: 'pointer' }}
        onClick={() => alert(`Work Required: ${job.work_required}`)}
      >
        {job.work_order}
      </td>
      <td>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            alert(`Customer Address: ${job.customer_address}`);
            window.open(mapsUrl, '_blank');
          }}
          style={{ textDecoration: 'underline' }}
        >
          {job.customer_name}
        </a>
      </td>
      <td>{requiredDate}</td>
      <td className={statusClass}>{displayStatus}</td>
      <td>{onsiteTime}</td>
      <td>{updatedTime}</td>
      <td>
        {job.status === 'Pending' && (
          <button onClick={handleOnsite}>Onsite</button>
        )}
        {job.status !== 'Completed' &&
          job.status !== 'Completed - Pending Approval' && (
            <button onClick={handleCompletedClick}>Job Completed</button>
          )}
      </td>
    </tr>
  );
}

export default JobRow;
