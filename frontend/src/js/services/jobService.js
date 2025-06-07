// services/jobService.js
import { csrfFetch, G } from '../globals.js';

const JOBS_API     = `${G.API_BASE_URL}/jobs`;
const MACHINES_API = `${G.API_BASE_URL}/machines`;

export async function fetchJob(id) {
  const res = await csrfFetch(`${JOBS_API}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch job');
  return res.json();
}

export async function fetchMachines() {
  const res = await csrfFetch(MACHINES_API);
  if (!res.ok) throw new Error('Failed to fetch machines');
  return res.json();
}

/**
 * Generic update function — does PATCH by default, or PUT if full=true.
 * @param {string|number} id
 * @param {object} payload — the fields to send
 * @param {boolean} [full=false] — use PUT (true) or PATCH (false)
 */
export async function updateJob(id, payload, full = false) {
  const method = full ? 'PUT' : 'PATCH';
  const res = await csrfFetch(`${JOBS_API}/${id}`, {
    method,
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to ${method} job`);
  return res.json();
}

// keep the old names for clarity in your controllers:
export const patchJob = (id, payload) => updateJob(id, payload, false);
export const putJob   = (id, payload) => updateJob(id, payload, true);
