import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { formatForDisplayLocal } from '../../utils/timeUtils';
import { moveJobToInProgress } from '../../api/jobs';
import { getStatusClass } from '../../utils/statusUtils';
import AddressMapModal from '../modals/AddressMapModal'; // ← add this file if you haven't

function JobRow({ job, refreshJobs, onOpenModal, onDismiss }) {
  const { user } = useContext(AppContext);
  const [showMap, setShowMap] = useState(false);

  const requiredDate = job?.required_date ? formatForDisplayLocal(job.required_date) : 'N/A';
  const onsiteTime   = job?.onsite_time ? formatForDisplayLocal(job.onsite_time) : 'Not Logged';
  const updatedTime  = job?.status_timestamp ? formatForDisplayLocal(job.status_timestamp) : 'Not Updated';

  const rawStatus = job?.contractor_status || job?.status || 'Unknown';
  const displayStatus =
    rawStatus === 'Approved' && (user?.role === 'contractor' || user?.role === 'technician')
      ? 'Completed'
      : rawStatus;

  const statusClass = `status-cell ${getStatusClass(displayStatus)}`;

  const handleOnsite = async () => {
    try {
      await moveJobToInProgress(job.id);
      refreshJobs?.();
    } catch (e) {
      console.error('Failed to move job to In Progress', e);
    }
  };

  return (
    <>
      <tr>
        <td style={{ cursor: 'pointer' }} onClick={() => alert(`Work Required: ${job.work_required}`)}>
          {job.work_order}
        </td>
        <td>
          <button
            type="button"
            onClick={() => setShowMap(true)}
            style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer' }}
            title="Show location"
          >
            {job.customer_name}
          </button>
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
          onClose={() => setShowMap(false)}
        />
      )}
    </>
  );
}

export default JobRow;
