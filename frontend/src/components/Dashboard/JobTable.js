import React from "react";
import { formatForDisplayLocal } from "../../utils/timeUtils";
import { getStatusClass } from "../../utils/statusUtils";

function JobTable({ jobs, onReviewClick, onDismiss }) {
  const sortedJobs = [...jobs].sort((a, b) => {
    const numA = parseInt(a.work_order?.replace(/\D/g, "") || 0);
    const numB = parseInt(b.work_order?.replace(/\D/g, "") || 0);
    return numA - numB;
  });

  return (
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
            <th>Assigned To</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedJobs.length === 0 ? (
            <tr>
              <td colSpan="8">No jobs to display.</td>
            </tr>
          ) : (
            sortedJobs.map((job) => {
              //  Format just the date for Required Date
              const requiredDate = job.required_date
                ? new Date(job.required_date).toLocaleDateString()
                : "N/A";

              const onsiteTime = job.onsite_time
                ? formatForDisplayLocal(job.onsite_time)
                : "Not Logged";

              const updatedTime = job.status_timestamp
                ? formatForDisplayLocal(job.status_timestamp)
                : "Not Updated";

              const status = job.status || "Unknown";
              const statusClass = `status-cell ${getStatusClass(status)}`;

              return (
                <tr key={job.id}>
                  <td>{job.work_order}</td>
                  <td>{job.customer_name}</td>
                  <td>{requiredDate}</td>
                  <td className={statusClass}>{status}</td>
                  <td>{onsiteTime}</td>
                  <td>{updatedTime}</td>
                  <td>
                    {job.contractor
                      ? `${job.contractor}`
                      : job.technician
                      ? `${job.technician}`
                      : "Unassigned"}
                  </td>
                  <td>
                    {status === "Completed - Pending Approval" ? (
                      <button onClick={() => onReviewClick(job)}>Review</button>
                    ) : status === "Completed" ? (
                      <button onClick={() => onDismiss?.(job.id)}>Dismiss</button>
                    ) : null}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default JobTable;
