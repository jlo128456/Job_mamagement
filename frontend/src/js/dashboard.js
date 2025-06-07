import { G } from './globals.js';
import { formatForDisplayLocal, applyStatusColor, formatForMySQLUTC } from './utils.js';

import { checkForJobUpdates, refreshContractorView, updateJobStatus } from './api.js';
import { moveJobToInProgress, showUpdateJobForm, showAdminReviewModal } from './jobActions.js';

/**
 * Show the appropriate dashboard (admin, contractor, or tech).
 */
export function showDashboard(role) {
  // Hide all views first
  G.adminView.style.display = "none";
  G.contractorView.style.display = "none";
  G.techView.style.display = "none";

  // Clear existing polling interval (if any)
  if (G.pollingInterval) {
    clearInterval(G.pollingInterval);
    G.pollingInterval = null;
  }

  if (role === "admin") {
    G.adminView.style.display = "block";
    populateAdminJobs();

    // Start polling for updates if not already
    G.pollingInterval = setInterval(async () => {
      await checkForJobUpdates();
      populateAdminJobs();
    }, 5000);

  } else if (role === "contractor") {
    G.contractorView.style.display = "block";
    // We use the current user's id directly instead of contractor username.
    populateContractorJobs(G.currentUser.id);

    G.pollingInterval = setInterval(async () => {
      await refreshContractorView();
      populateContractorJobs(G.currentUser.id);
    }, 5000);

  } else if (role === "technician") {
    // Show Tech view
    G.techView.style.display = "block";
    populateTechJobs(G.currentUser.id);

    G.pollingInterval = setInterval(async () => {
      await refreshContractorView();
      populateTechJobs(G.currentUser.id);
    }, 5000);
  }
}

/**
 * Populate Admin Dashboard (renders table + sets up the modal form).
 */
export async function populateAdminJobs() {
  // Clear out existing rows first
  G.adminJobList.innerHTML = "";

  if (!Array.isArray(G.jobs)) {
    console.error("G.jobs is not an array. Current value:", G.jobs);
    return;
  }

  // Render each job as a table row
  G.jobs.forEach((job) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${job.work_order || 'N/A'}</td>
      <td>${job.customer_name || 'N/A'}</td>
      <td>${job.contractor || 'N/A'}</td>
      <td>${job.role || 'N/A'}</td>
      <td class="status-cell">${job.status || 'N/A'}</td>
      <td class="last-updated">${job.status_timestamp ? formatForDisplayLocalLocal(job.status_timestamp) : 'Not Updated'}</td>
      <td>${
        job.status === "Completed - Pending Approval"
          ? `<button class="review-job" data-id="${job.id}">Review</button>`
          : ""
      }
      </td>
    `;

    G.adminJobList.appendChild(row);

    // Apply color styling
    applyStatusColor(row.querySelector(".status-cell"), job.status);
  });

  //  Ensure correct event listeners for buttons
  document.querySelectorAll(".review-job").forEach(btn =>
    btn.addEventListener("click", e => {
      const jobId = e.target.dataset.id;
      showAdminReviewModal(jobId);
    })
  );

  document.querySelectorAll(".approve-job").forEach(btn =>
    btn.addEventListener("click", e => {
      const jobId = e.target.dataset.id;
      updateJobStatus(jobId, "Approved");
    })
  );

  document.querySelectorAll(".reject-job").forEach(btn =>
    btn.addEventListener("click", e => {
      const jobId = e.target.dataset.id;
      updateJobStatus(jobId, "Rejected");
    })
  );

  //  Setup the "Create New Job" modal only once
  if (!G.modalInitialized) {
    setupCreateJobModal();
    G.modalInitialized = true;
  }
}


/** 
 * Initialize the Create Job modal logic and form submission 
 */
function setupCreateJobModal() {
  const openModalBtn = document.getElementById("openCreateJobModal");
  const closeOverlay = document.getElementById("closeCreateModalOverlay");
  const closeBtn = document.getElementById("closeCreateJobModal");
  const modal = document.getElementById("createJobModal");
  const dashboard = document.getElementById("adminJobsTable");
  const addJobForm = document.getElementById("admin-add-job-form");

  // Function to open the modal and hide the dashboard
  function openModal() {
    if (!modal) {
      console.error("Create Job Modal not found!");
      return;
    }
    modal.style.display = "flex"; // Show modal
    modal.scrollIntoView({ behavior: "smooth" }); // Ensure visibility
    if (dashboard) dashboard.classList.add("hidden"); // Hide dashboard
    document.body.classList.add("modal-open"); // Disable scrolling
  }

  // Function to close the modal and restore the dashboard
  function closeModal() {
    if (!modal) return;
    modal.style.display = "none";
    if (dashboard) dashboard.classList.remove("hidden"); // Show dashboard again
    document.body.classList.remove("modal-open"); // Enable scrolling
  }

  //  Show modal when "Create New Job" button is clicked
  if (openModalBtn) {
    openModalBtn.addEventListener("click", openModal);
  } else {
    console.warn("Create Job button not found!");
  }

  //  Hide modal when clicking overlay or pressing close button
  if (closeOverlay) {
    closeOverlay.addEventListener("click", closeModal);
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  //  Prevent duplicate listeners & handle form submission
  if (addJobForm && !addJobForm.dataset.listenerAttached) {
    addJobForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Collect form values
      const workOrder = document.getElementById("work_order").value.trim();
      const customerName = document.getElementById("customer_name").value.trim();
      const customerAddress = document.getElementById("customer_address").value.trim();
      const contractor = document.getElementById("contractor").value.trim();
      const workRequired = document.getElementById("work_required").value.trim();
      const role = document.getElementById("role").value;

      // Build new job object
      const newJob = {
        work_order: workOrder,
        customer_name: customerName,
        customer_address: customerAddress,
        contractor: contractor,
        work_required: workRequired,
        role,
      };

      try {
        // POST to server
        const response = await fetch(`${G.API_BASE_URL}/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newJob),
        });

        if (!response.ok) {
          throw new Error(`Error creating job: ${response.status}`);
        }

        // Add newly inserted job
        const createdJob = await response.json();
        G.jobs.push(createdJob);

        // Refresh the table
        populateAdminJobs();

        // Close the modal and clear the form
        closeModal();
        addJobForm.reset();
      } catch (err) {
        console.error("Create job failed:", err);
        alert("Failed to create job, see console for details.");
      }
    });

    addJobForm.dataset.listenerAttached = "true"; // Prevent duplicate listeners
  }
}

//  Call `setupCreateJobModal()` when the page loads
document.addEventListener("DOMContentLoaded", setupCreateJobModal);



//SEt updatejobmodal
function setupUpdateJobModal() {
  const openUpdateModalBtns = document.querySelectorAll(".edit-job"); // Edit job buttons
  const closeOverlay = document.getElementById("closeUpdateModalOverlay");
  const closeBtn = document.getElementById("closeUpdateJobModal");
  const modal = document.getElementById("updateJobContainer");
  const dashboard = document.getElementById("adminJobsTable");

  // Function to open the modal and hide the dashboard
  function openModal(jobId) {
    if (!modal) {
      console.error("Update Job Modal not found!");
      return;
    }
    modal.style.display = "flex"; // Show modal
    modal.scrollIntoView({ behavior: "smooth" }); // Ensure visibility
    if (dashboard) dashboard.classList.add("hidden"); // Hide dashboard
    document.body.classList.add("modal-open"); // Disable scrolling

    //  Load job details into the modal
    loadJobDetails(jobId);
  }

  // Function to close the modal and restore the dashboard
  function closeModal() {
    if (!modal) return;
    modal.style.display = "none";
    if (dashboard) dashboard.classList.remove("hidden"); // Show dashboard again
    document.body.classList.remove("modal-open"); // Enable scrolling
  }

  //  Show modal when "Edit Job" button is clicked
  openUpdateModalBtns.forEach(button => {
    button.addEventListener("click", function () {
      const jobId = this.dataset.id;
      openModal(jobId);
    });
  });

  //  Hide modal when clicking overlay or pressing close button
  if (closeOverlay) {
    closeOverlay.addEventListener("click", closeModal);
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }
}

//  Call `setupUpdateJobModal()` when the page loads
document.addEventListener("DOMContentLoaded", setupUpdateJobModal);


/**
 * Populate Contractor Dashboard.
 */
export function populateContractorJobs(contractorId) {
  if (contractorId !== G.currentUser.id) {
    console.warn(`Parameter contractorId (${contractorId}) does not match G.currentUser.id (${G.currentUser.id}). Overriding parameter with G.currentUser.id.`);
    contractorId = G.currentUser.id;
  }

  if (!G.contractorJobList) {
    console.error("G.contractorJobList is not defined or not found in the DOM.");
    return;
  }

  G.contractorJobList.innerHTML = "";

  if (!Array.isArray(G.jobs)) {
    console.error("G.jobs is not an array. Current value:", G.jobs);
    return;
  }

  const contractorJobs = G.jobs.filter(job => job.assigned_contractor === contractorId);
  if (contractorJobs.length === 0) {
    G.contractorJobList.innerHTML = `<tr><td colspan="6">No jobs found for this contractor.</td></tr>`;
    return;
  }

  contractorJobs.forEach(job => {
    const requiredDate = job.required_date ? formatForDisplayLocal(job.required_date) : "N/A";
    const loggedTime = job.onsite_time ? formatForDisplayLocal(job.onsite_time) : "Not Logged";
    const displayStatus = job.contractor_status || job.status;

     // Create Google Maps URL
     const encodedAddress = encodeURIComponent(job.customer_address);
     const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

     

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="work-order" data-id="${job.id}" style="cursor: pointer;">${job.work_order}</td>
      <td>
        <a href="${mapsUrl}" target="_blank" class="customer-name" data-address="${job.customer_address}" style="cursor: pointer; text-decoration: underline;">
          ${job.customer_name}
        </a>
      </td>
      <td>${requiredDate}</td>
      <td class="status-cell">${displayStatus}</td>
      <td>${loggedTime}</td>
      <td>
        ${
          job.status === "Pending"
            ? `<button class="btn btn-info btn-sm onsite-job" data-id="${job.id}">Onsite</button>`
            : ""
        }
        <button class="btn btn-success btn-sm update-job" data-id="${job.id}">Job Completed</button>
      </td>
    `;

    G.contractorJobList.appendChild(row);
    applyStatusColor(row.querySelector(".status-cell"), displayStatus);
  });

  // Event listeners for work order (work required alert)
  document.querySelectorAll(".work-order").forEach(cell =>
    cell.addEventListener("click", e => {
      const jobId = e.target.dataset.id;
      const job = G.jobs.find(j => j.id === jobId);
      if (job) {
        alert(`Work Required: ${job.work_required}`);
      }
    })
  );

  // Event listeners for customer name (display customer address)
  document.querySelectorAll(".customer-name").forEach(cell =>
    cell.addEventListener("click", e => {
      alert(`Customer Address: ${e.target.dataset.address}`);
    })
  );

  // Onsite button event handlers
  document.querySelectorAll(".onsite-job").forEach(button =>
    button.addEventListener("click", e => moveJobToInProgress(e.target.dataset.id))
  );

  // Job Completed button event handlers
  document.querySelectorAll(".update-job").forEach(button =>
    button.addEventListener("click", e => {
      console.log("Update job button clicked for job id:", e.target.dataset.id);
      showUpdateJobForm(e.target.dataset.id);
    })
  );
}


/**
 * Populate Tech Dashboard (same structure as Contractor Dashboard).
 */
export function populateTechJobs(Techid) {
  if (Techid !== G.currentUser.id) {
    console.warn(`Parameter contractorId (${Techid}) does not match G.currentUser.id (${G.currentUser.id}). Overriding parameter with G.currentUser.id.`);
    Techid = G.currentUser.id;
  }
  G.techJobList.innerHTML = "";

  if (!G.techJobList) {
    console.error("G.contractorJobList is not defined or not found in the DOM.");
    return;
  }

  if (!Array.isArray(G.jobs)) {
    console.error("G.jobs is not an array. Current value:", G.jobs);
    return;
  }

  const techJobs = G.jobs.filter(job => job.assigned_tech === Techid);
  if (techJobs.length === 0) {
    G.techJobList.innerHTML = `<tr><td colspan="7">No jobs found for this technician.</td></tr>`;
    return;
  }

  techJobs.forEach(job => {
    const requiredDate = job.required_date ? formatForDisplayLocal(job.required_date) : "N/A";
    const loggedTime = job.onsite_time ? formatForDisplayLocal(job.onsite_time) : "Not Logged";
    const displayStatus = job.contractor_status || job.status;

      // Create Google Maps URL
      const encodedAddress = encodeURIComponent(job.customer_address);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="work-order" data-id="${job.id}" style="cursor: pointer;">${job.work_order}</td>
      <td>
        <a href="${mapsUrl}" target="_blank" class="customer-name" data-address="${job.customer_address}" style="cursor: pointer; text-decoration: underline;">
          ${job.customer_name}
        </a>
      </td>
      <td>${requiredDate}</td>
      <td class="status-cell">${displayStatus}</td>
      <td>${loggedTime}</td> 
      <td>
        ${
          job.status === "Pending"
            ? `<button class="btn btn-info btn-sm onsite-job" data-id="${job.id}">Onsite</button>`
            : ""
        }
        <button class="btn btn-success btn-sm update-job" data-id="${job.id}">Job Completed</button>
      </td>
    `;

    G.techJobList.appendChild(row);
    applyStatusColor(row.querySelector(".status-cell"), displayStatus);
  });

  // Event listeners for work order (work required alert)
  document.querySelectorAll(".work-order").forEach(cell =>
    cell.addEventListener("click", e => {
      const jobId = e.target.dataset.id;
      const job = G.jobs.find(j => j.id === jobId);
      if (job) {
        alert(`Work Required: ${job.work_required}`);
      }
    })
  );

  // Event listeners for customer name (display customer address)
  document.querySelectorAll(".customer-name").forEach(cell =>
    cell.addEventListener("click", e => {
      alert(`Customer Address: ${e.target.dataset.address}`);
    })
  );

  // Onsite button event handlers
  document.querySelectorAll(".onsite-job").forEach(button =>
    button.addEventListener("click", e => moveJobToInProgress(e.target.dataset.id))
  );

  // Job Completed button event handlers
  document.querySelectorAll(".update-job").forEach(button =>
    button.addEventListener("click", e => showUpdateJobForm(e.target.dataset.id))
  );
}
