import { G, csrfFetch } from '../globals.js';
import { formatForDisplayLocal, applyStatusColor } from '../utils.js';
import { updateJobStatus } from '../api.js';
import { showAdminReviewModal } from '../jobActions.js';
import { setupCreateJobModal } from './modal.js';

export function populateAdminJobs() {
  G.adminJobList.innerHTML = "";
  if (!Array.isArray(G.jobs)) return;

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
}
