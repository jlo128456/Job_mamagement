import React, { useEffect } from "react";
import { G } from "../globals";
import { formatForDisplayLocal, applyStatusColor } from "../utils";
import { showAdminReviewModal } from "../jobActions";
import { setupCreateJobModal } from "./modal";

const AdminView = () => {
  useEffect(() => {
    if (!Array.isArray(G.jobs) || !G.adminJobList) return;

    G.adminJobList.innerHTML = "";

    G.jobs.forEach(job => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${job.work_order || 'N/A'}</td>
        <td>${job.customer_name || 'N/A'}</td>
        <td>${job.contractor || 'N/A'}</td>
        <td>${job.role || 'N/A'}</td>
        <td class="status-cell">${job.status || 'N/A'}</td>
        <td class="last-updated">${job.status_timestamp ? formatForDisplayLocal(job.status_timestamp) : 'Not Updated'}</td>
        <td>${job.status === "Completed - Pending Approval" ? `<button class="review-job" data-id="${job.id}">Review</button>` : ""}</td>
      `;
      G.adminJobList.appendChild(row);
      applyStatusColor(row.querySelector(".status-cell"), job.status);
    });

    document.querySelectorAll(".review-job").forEach(btn =>
      btn.addEventListener("click", e => showAdminReviewModal(e.target.dataset.id))
    );

    document.querySelectorAll(".approve-job").forEach(btn =>
      btn.addEventListener("click", e => updateJobStatus(e.target.dataset.id, "Approved"))
    );

    document.querySelectorAll(".reject-job").forEach(btn =>
      btn.addEventListener("click", e => updateJobStatus(e.target.dataset.id, "Rejected"))
    );

    if (!G.modalInitialized) {
      setupCreateJobModal();
      G.modalInitialized = true;
    }
  }, []);

  return (
    <section id="admin-view">
      <h2>Admin Dashboard</h2>
      <table>
        <thead>
          <tr>
            <th>Work Order</th>
            <th>Customer</th>
            <th>Contractor</th>
            <th>Role</th>
            <th>Status</th>
            <th>Updated</th>
            <th>Review</th>
          </tr>
        </thead>
        <tbody ref={el => G.adminJobList = el}></tbody>
      </table>
    </section>
  );
};

export default AdminView;