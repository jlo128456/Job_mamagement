import { fetchJob, patchJob } from '../services/jobService.js';
import { openModal } from '../ui/modal.js';
import { populateAdminJobs } from '../dashboard/admin.js';
import { populateContractorJobs } from '../dashboard/contractor.js';
import { populateTechJobs } from '../dashboard/technician.js';
import { G } from '../globals.js';

function refreshAll() {
  populateAdminJobs(G.jobs);
  populateContractorJobs(G.currentUser.id);
  populateTechJobs(G.currentUser.id);
}

export async function showAdminReviewModal(id) {
  try {
    const job = await fetchJob(id);
    const html = `
      <button class="close-btn">&times;</button>
      <h3>Review ${job.work_order}</h3>
      <div>Contractor: ${job.contractor}</div>
      <div><button data-approve>Approve</button>
           <button data-reject>Reject</button></div>
    `;
    const m = openModal('adminReviewModal', html);
    m.querySelector('[data-approve]').onclick = async ()=>{
      await patchJob(id, {status:'Approved'});
      m.remove(); refreshAll();
    };
    m.querySelector('[data-reject]').onclick = async ()=>{
      await patchJob(id, {status:'Rejected'});
      m.remove(); refreshAll();
    };
  } catch(e){ console.error(e); alert('Error loading review'); }
}