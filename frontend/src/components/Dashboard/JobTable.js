import React from "react";
import { formatForDisplayLocal } from "../../utils/timeUtils";
import { getStatusClass } from "../../utils/statusUtils";

function JobTable({ jobs, onReviewClick }) {
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan="7">No jobs to display.</td>
            </tr>
          ) : (
            jobs.map((job) => {
              const requiredDate = job.required_date
                ? formatForDisplayLocal(job.required_date)
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
                    <button onClick={() => onReviewClick(job)}>Review</button>
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
