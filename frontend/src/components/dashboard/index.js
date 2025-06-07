import { checkForJobUpdates, refreshContractorView } from '../api.js';
import { populateAdminJobs } from './admin.js';
import { populateContractorJobs } from './contractor.js';
import { populateTechJobs } from './technician.js';
import { G } from '../globals.js';

export function showDashboard(role) {
  G.adminView.style.display = "none";
  G.contractorView.style.display = "none";
  G.techView.style.display = "none";

  if (G.pollingInterval) clearInterval(G.pollingInterval);

  if (role === "admin") {
    G.adminView.style.display = "block";
    populateAdminJobs();
    G.pollingInterval = setInterval(async () => {
      await checkForJobUpdates();
      populateAdminJobs();
    }, 5000);
  } else if (role === "contractor") {
    G.contractorView.style.display = "block";
    populateContractorJobs(G.currentUser.id);
    G.pollingInterval = setInterval(async () => {
      await refreshContractorView();
      populateContractorJobs(G.currentUser.id);
    }, 5000);
  } else if (role === "technician") {
    G.techView.style.display = "block";
    populateTechJobs(G.currentUser.id);
    G.pollingInterval = setInterval(async () => {
      await refreshContractorView();
      populateTechJobs(G.currentUser.id);
    }, 5000);
  }
}
