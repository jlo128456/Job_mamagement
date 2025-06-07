import { G } from '../globals.js';
import { formatForDisplayLocal, applyStatusColor } from '../utils.js';
import { moveJobToInProgress, showUpdateJobForm } from '../jobActions.js';

export function populateTechJobs(techId) {
  if (techId !== G.currentUser.id) techId = G.currentUser.id;

  if (!G.techJobList) return console.error("G.techJobList not found.");
  G.techJobList.innerHTML = "";

  const techJobs = G.jobs.filter(job => job.assigned_tech === techId);
  if (techJobs.length === 0) {
    G.techJobList.innerHTML = `<tr><td colspan="7">No jobs found for this technician.</td></tr>`;
    return;
  }

  techJobs.forEach(job => {
    const requiredDate = job.required_date ? formatForDisplayLocal(job.required_date) : "N/A";
    const loggedTime = job.onsite_time ? formatForDisplayLocal(job.onsite_time) : "Not Logged";
    const displayStatus = job.contractor_status || job.status;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.customer_address)}`;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="work-order" data-id="${job.id}" style="cursor: pointer;">${job.work_order}</td>
      <td>
        <a href="${mapsUrl}" target="_blank" class="customer-name" data-address="${job.customer_address}" style="text-decoration: underline;">
          ${job.customer_name}
        </a>
      </td>
      <td>${requiredDate}</td>
      <td class="status-cell">${displayStatus}</td>
      <td>${loggedTime}</td>
      <td>
        ${job.status === "Pending" ? `<button class="btn onsite-job" data-id="${job.id}">Onsite</button>` : ""}
        <button class="btn update-job" data-id="${job.id}">Job Completed</button>
      </td>
    `;
    G.techJobList.appendChild(row);
    applyStatusColor(row.querySelector(".status-cell"), displayStatus);
  });

  document.querySelectorAll(".work-order").forEach(cell =>
    cell.addEventListener("click", e => {
      const job = G.jobs.find(j => j.id === e.target.dataset.id);
      if (job) alert(`Work Required: ${job.work_required}`);
    })
  );

  document.querySelectorAll(".customer-name").forEach(cell =>
    cell.addEventListener("click", e => {
      alert(`Customer Address: ${e.target.dataset.address}`);
    })
  );

  document.querySelectorAll(".onsite-job").forEach(button =>
    button.addEventListener("click", e => moveJobToInProgress(e.target.dataset.id))
  );

  document.querySelectorAll(".update-job").forEach(button =>
    button.addEventListener("click", e => showUpdateJobForm(e.target.dataset.id))
  );
}
