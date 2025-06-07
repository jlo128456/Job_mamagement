import { G } from './globals.js';
import { showDashboard } from './dashboard/index.js';
import { populateAdminJobs } from './dashboard/admin.js';
import { populateContractorJobs } from './dashboard/contractor.js';
import { populateTechJobs } from './dashboard/technician.js';
/**
 * Load jobs and users from the API and store them in globals.
 */
export async function loadData() {
  try {
    const jobsResponse = await fetch(`${G.API_BASE_URL}/jobs`);
    if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
    G.jobs = await jobsResponse.json();
    console.log('Jobs loaded:', G.jobs);

    const usersResponse = await fetch(`${G.API_BASE_URL}/users`);
    if (!usersResponse.ok) throw new Error('Failed to fetch users');
    G.users = await usersResponse.json();
    console.log('Users loaded:', G.users);
  } catch (error) {
    console.error('Error loading data:', error);
    G.jobs = [];
    G.users = [];
  }
}

/**
 * Update a job's status and refresh the UI.
 * @param {number} jobId - The job ID.
 */
export async function updateJobStatus(id) {
  try {
    const response = await fetch(`${G.API_BASE_URL}/jobs/${id}`);
    if (!response.ok) throw new Error('Failed to fetch job');
    const job = await response.json();
    if (!job) return;

    const currentTime = new Date().toISOString();

    let updatedStatus, contractorStatus, statusMessage;

    switch (job.status) {
      case 'Pending':
        updatedStatus = 'In Progress';
        contractorStatus = 'In Progress';
        statusMessage = `Job moved to 'In Progress' at ${currentTime}.`;
        break;
      case 'In Progress':
        updatedStatus = 'Completed - Pending Approval';
        contractorStatus = 'Completed';
        statusMessage = `Job completed and moved to 'Completed - Pending Approval' at ${currentTime}.`;
        break;
      default:
        console.error('Invalid action: The job is already completed or approved.');
        return;
    }

    const updatedJob = {
      ...job,
      status: updatedStatus,
      contractor_status: contractorStatus,
      status_timestamp: currentTime
    };

    console.log("Updated job payload:", updatedJob);

    const updateResponse = await fetch(`${G.API_BASE_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedJob),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update job status: ${errorText}`);
    }

    console.log(statusMessage);
    alert(statusMessage);
    await refreshContractorView(); // <-- use this for live dashboard refresh
  } catch (error) {
    console.error('Error updating job status:', error);
  }
}


/**
 * Periodically check for job updates and refresh the UI.
 */
export async function checkForJobUpdates() {
  try {
    const response = await fetch(`${G.API_BASE_URL}/jobs`);
    if (!response.ok) return;
    const latestJobs = await response.json();
    if (JSON.stringify(latestJobs) !== JSON.stringify(G.jobs)) {
      console.log('Job list updated. Refreshing dashboard...');
      G.jobs = latestJobs;
      refreshDashboard();
    }
  } catch (error) {
    console.error('Error checking job updates:', error);
  }
}

/**
 * Refresh contractor's or technician's job view based on the current user.
 */
export async function refreshContractorView() {
  try {
    const response = await fetch(`${G.API_BASE_URL}/jobs`);
    if (!response.ok) return;
    const allJobs = await response.json();

    console.log("All jobs:", allJobs);
    allJobs.forEach(job => {
      console.log(
        `Job ID: ${job.id} | Role: ${job.role} | Assigned Contractor: ${job.assigned_contractor} | Assigned Tech: ${job.assigned_tech}`
      );
    });

    if (!G.currentUser) {
      G.jobs = [];
    } else if (G.currentUserRole === "admin") {
      G.jobs = allJobs;
    } else if (G.currentUserRole === "contractor") {
      const normalizedUserId = G.currentUser.id ? G.currentUser.id.trim() : "";
      G.jobs = allJobs.filter(job => {
        const normalizedRole = job.role.toLowerCase().trim();
        const normalizedAssigned = job.assigned_contractor
          ? job.assigned_contractor.trim()
          : "";
        const roleMatch = normalizedRole === "contractor";
        const idMatch = normalizedAssigned === normalizedUserId;
        console.log(
          `Job ID: ${job.id} | roleMatch: ${roleMatch} | idMatch: ${idMatch} | ` +
          `job.assigned_contractor: "${normalizedAssigned}" | G.currentUser.id: "${normalizedUserId}"`
        );
        return roleMatch && idMatch;
      });
    } else if (G.currentUserRole === "technician") {
      const normalizedUserId = G.currentUser.id ? G.currentUser.id.trim() : "";
      G.jobs = allJobs.filter(job =>
        job.role.toLowerCase().trim() === "technician" &&
        (job.assigned_tech ? job.assigned_tech.trim() : "") === normalizedUserId
      );
    } else {
      G.jobs = [];
    }

    console.log("Job list filtered for role:", G.currentUserRole, G.jobs);
    showDashboard(G.currentUserRole);
  } catch (error) {
    console.error("Error refreshing contractor/tech view:", error);
  }
}

/**
 * Delete a job and refresh the UI.
 */
export async function deleteJob(id) {
  if (!confirm('Are you sure you want to delete this job?')) return;
  try {
    const response = await fetch(`${G.API_BASE_URL}/jobs/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete job.');
    alert('Job deleted successfully.');
    await loadData();
    refreshDashboard();
  } catch (error) {
    console.error('Error deleting job:', error);
    alert('Failed to delete the job.');
  }
}

/**
 * Refresh the dashboard view based on the user role.
 */
function refreshDashboard() {
  if (G.currentUserRole === 'admin') {
    populateAdminJobs(G.jobs);
  } else if (G.currentUserRole === 'technician') {
    populateTechJobs(G.jobs);
  } else {
    populateContractorJobs(G.currentUser.id);
  }
  showDashboard(G.currentUserRole);
}
