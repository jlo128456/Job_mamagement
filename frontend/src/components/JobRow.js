import React, { useState } from 'react';
import { formatForDisplayLocal } from '../utils/timeUtils';
import { moveJobToInProgress } from '../api/jobs';
import UpdateJobModal from './modals/UpdateJobModal';

function JobRow({ job, refreshJobs }) {
  const [showModal, setShowModal] = useState(false);

  const requiredDate = job?.required_date
    ? formatForDisplayLocal(job.required_date)
    : "N/A";
  const loggedTime = job?.onsite_time
    ? formatForDisplayLocal(job.onsite_time)
    : "Not Logged";
  const status = job?.contractor_status || job?.status || "Unknown";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.customer_address || '')}`;

  const handleOnsite = async () => {
    try {
      await moveJobToInProgress(job.id);
      refreshJobs?.();
    } catch (e) {
      console.error("Failed to move job to In Progress", e);
    }
  };

  const handleCloseModal = async () => {
    setShowModal(false);
    refreshJobs?.();
  };

  return (
    <>
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
            onClick={e => {
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
        <td className={`status-cell ${status.toLowerCase().replace(/\s/g, '-')}`}>
          {status}
        </td>
        <td>{loggedTime}</td>
        <td>
          {job.status === 'Pending' && (
            <button onClick={handleOnsite}>Onsite</button>
          )}
          <button onClick={() => setShowModal(true)} disabled={showModal}>
            Job Completed
          </button>
        </td>
      </tr>

      {showModal && (
        <UpdateJobModal jobId={job.id} onClose={handleCloseModal} />
      )}
    </>
  );
}

export default JobRow;
