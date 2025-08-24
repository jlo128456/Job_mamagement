import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { formatForDisplayLocal } from '../../utils/timeUtils';
import { moveJobToInProgress } from '../../api/jobs';
import { getStatusClass } from '../../utils/statusUtils';
import AddressMapModal from '../modals/AddressMapModal';

function JobRow({ job, refreshJobs, onOpenModal, onDismiss }) {
  const { user } = useContext(AppContext);
  const [showMap, setShowMap] = useState(false);

  const requiredDate = job?.required_date ? formatForDisplayLocal(job.required_date) : 'N/A';
  const onsiteTime   = job?.onsite_time ? formatForDisplayLocal(job.onsite_time) : 'Not Logged';
  const updatedTime  = job?.status_timestamp ? formatForDisplayLocal(job.status_timestamp) : 'Not Updated';

  const rawStatus = job?.contractor_status || job?.status || 'Unknown';
  const displayStatus =
    rawStatus === 'Approved' && (user?.role === 'contractor' || user?.role === 'technician')
      ? 'Completed' : rawStatus;

  const statusClass = `status-cell ${getStatusClass(displayStatus)}`;
  const mapsUrl = job?.customer_address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.customer_address)}`
    : '#';

  const handleOnsite = async () => {
    try { await moveJobToInProgress(job.id); refreshJobs?.(); }
    catch (e) { console.error('Failed to move job to In Progress', e); }
  };

  return (
    <>
      <tr>
        <td style={{ cursor: 'pointer' }} onClick={() => alert(`Work Required: ${job.work_required}`)}>
          {job.work_order}
        </td>
        <td>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={job.customer_address ? 'View location' : 'No address on file'}
            onClick={(e) => {
              // open modal by default; let modified-click open a new tab
              if (!(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) {
                e.preventDefault();
                setShowMap(true);
              }
            }}
            style={{ textDecoration: 'underline', cursor: 'pointer' }}
          >
            {job.customer_name}
          </a>
        </td>
        <td>{requiredDate}</td>
        <td className={statusClass}>{displayStatus}</td>
        <td>{onsiteTime}</td>
        <td>{updatedTime}</td>
        <td>
          {job.status === 'Pending' && <button onClick={handleOnsite}>Onsite</button>}
          {job.status !== 'Completed' && job.status !== 'Completed - Pending Approval' && (
            <button onClick={onOpenModal}>Job Completed</button>
          )}
          {job.status === 'Completed' && <button onClick={() => onDismiss?.(job.id)}>Dismiss</button>}
        </td>
      </tr>

      {showMap && (
        <AddressMapModal
          address={job.customer_address}
          name={job.customer_name}
          onClose={() => setShowMap(false)}
        />
      )}
    </>
  );
}

export default JobRow;
