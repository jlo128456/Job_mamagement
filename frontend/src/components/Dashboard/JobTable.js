import React from "react";
import { formatForDisplayLocal } from "../../utils/timeUtils";
import { getStatusClass } from "../../utils/statusUtils";

const JobTable = React.memo(({ jobs, onReviewClick, onDismiss }) => {
  return (
    <table className="job-table">
      <thead>
        <tr>
          <th>Work Order</th>
          <th>Customer</th>
          <th>Contractor</th>
          <th>Role</th>
          <th>Status</th>
          <th>Onsite Time</th>
          <th>Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(jobs) && jobs.length > 0 ? (
          jobs.map((job) => {
            const showReview = job.status === "Completed - Pending Approval";
            const showDismiss = job.status === "Completed";

            return (
              <tr key={job.id}>
                <td>{job.work_order || "N/A"}</td>
                <td>{job.customer_name || "N/A"}</td>
                <td>{job.contractor || "N/A"}</td>
                <td>{job.role || "N/A"}</td>
                <td className={`status-cell ${getStatusClass(job.status)}`}>{job.status}</td>
                <td>{job.onsite_time ? formatForDisplayLocal(job.onsite_time) : "Not Logged"}</td>
                <td>{job.status_timestamp ? formatForDisplayLocal(job.status_timestamp) : "Not Updated"}</td>
                <td>
                  {showReview && <button onClick={() => onReviewClick(job)}>Review</button>}
                  {showDismiss && onDismiss && (
                    <button onClick={() => onDismiss(job.id)}>Dismiss</button>
                  )}
                </td>
              </tr>
            );
          })
        ) : (
          <tr><td colSpan="8">No jobs found</td></tr>
        )}
      </tbody>
    </table>
  );
});

export default JobTable;
