// src/components/JobRow.js
import React from 'react';
import { formatForDisplayLocal } from '../utils/timeUtils';
import { moveJobToInProgress } from '../api/jobs';

function JobRow({ job, onComplete }) {
  const requiredDate = job.required_date ? formatForDisplayLocal(job.required_date) : "N/A";
  const loggedTime = job.onsite_time ? formatForDisplayLocal(job.onsite_time) : "Not Logged";
  const status = job.contractor_status || job.status;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.customer_address)}`;

  return (
    <tr>
      <td style={{ cursor: 'pointer' }} onClick={() => alert(`Work Required: ${job.work_required}`)}>
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
      <td className={`status-cell ${status.toLowerCase().replace(/\s/g, '-')}`}>{status}</td>
      <td>{loggedTime}</td>
      <td>
        {job.status === 'Pending' && (
          <button onClick={() => moveJobToInProgress(job.id)}>Onsite</button>
        )}
        <button onClick={() => onComplete(job.id)}>Job Completed</button>
      </td>
    </tr>
  );
}

export default JobRow;
