// jobActions.js
import { showAdminReviewModal }   from './controllers/adminReview.js';
import { showUpdateJobForm }      from './controllers/updateForm.js';
import { moveJobToInProgress }    from './controllers/jobProgress.js';

// Map data-action values to controller functions
const actionMap = {
  'admin-review': showAdminReviewModal,
  'update-job':   showUpdateJobForm,
  'in-progress':  moveJobToInProgress,
};

// Delegate click events for any button with a data-action attribute
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-action][data-id]');
  if (!btn) return;
  const fn = actionMap[btn.dataset.action];
  if (fn) fn(btn.dataset.id);
});

// Also export for manual invocation if needed
export {
  showAdminReviewModal,
  showUpdateJobForm,
  moveJobToInProgress,
};
