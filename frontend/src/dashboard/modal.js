import { G, csrfFetch } from '../globals.js';
import { populateAdminJobs } from './admin.js';

export function setupCreateJobModal() {
  const openModalBtn = document.getElementById("openCreateJobModal");
  const closeOverlay = document.getElementById("closeCreateModalOverlay");
  const closeBtn = document.getElementById("closeCreateJobModal");
  const modal = document.getElementById("createJobModal");
  const dashboard = document.getElementById("adminJobsTable");
  const addJobForm = document.getElementById("admin-add-job-form");

  function openModal() {
    if (!modal) return;
    modal.style.display = "flex";
    modal.scrollIntoView({ behavior: "smooth" });
    if (dashboard) dashboard.classList.add("hidden");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = "none";
    if (dashboard) dashboard.classList.remove("hidden");
    document.body.classList.remove("modal-open");
  }

  if (openModalBtn) openModalBtn.addEventListener("click", openModal);
  if (closeOverlay) closeOverlay.addEventListener("click", closeModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  if (addJobForm && !addJobForm.dataset.listenerAttached) {
    addJobForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newJob = {
        work_order: document.getElementById("work_order").value.trim(),
        customer_name: document.getElementById("customer_name").value.trim(),
        customer_address: document.getElementById("customer_address").value.trim(),
        contractor: document.getElementById("contractor").value.trim(),
        work_required: document.getElementById("work_required").value.trim(),
        role: document.getElementById("role").value,
      };

      try {
        const response = await csrfFetch(`${G.API_BASE_URL}/jobs`, {
          method: "POST",
          body: JSON.stringify(newJob),
        });

        if (!response.ok) throw new Error(`Error creating job: ${response.status}`);
        const createdJob = await response.json();
        G.jobs.push(createdJob);
        populateAdminJobs();
        closeModal();
        addJobForm.reset();
      } catch (err) {
        console.error("Create job failed:", err);
        alert("Failed to create job, see console.");
      }
    });

    addJobForm.dataset.listenerAttached = "true";
  }
}
