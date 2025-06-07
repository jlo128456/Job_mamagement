import { csrfFetch } from '../globals.js';
import { getNowUTCMySQL, refreshAll } from '../utils.js';

export async function moveJobToInProgress(id) {
  try {
    const now = getNowUTCMySQL(); // e.g., "2025-05-22 09:15:00"
    console.log("🚀 Sending UTC time to API:", now);

    await csrfFetch(`/api/jobs/${id}/onsite`, {
      method: 'PATCH',
      body: JSON.stringify({ onsite_time: now }),
    });

    console.log(`Job ${id} moved to In Progress with onsite_time ${now}`);
    await refreshAll();
  } catch (err) {
    console.error('Error moving job to In Progress:', err);
    alert('Failed to update job status.');
  }
}
