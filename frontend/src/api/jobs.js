// Utility: fallback for API base URL
const getBaseUrl = (base) => base || process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';

// Load jobs and users
export async function loadData(API_BASE_URL) {
  const base = getBaseUrl(API_BASE_URL);
  try {
    const [jobsRes, usersRes] = await Promise.all([
      fetch(`${base}/jobs`),
      fetch(`${base}/users`)
    ]);

    if (!jobsRes.ok || !usersRes.ok) throw new Error('Fetch failed');

    return {
      jobs: await jobsRes.json(),
      users: await usersRes.json(),
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return { jobs: [], users: [] };
  }
}

// Update job status (e.g., Onsite → Completed)
export async function updateJobStatus(id, newStatus, API_BASE_URL) {
  const base = getBaseUrl(API_BASE_URL);
  const time = new Date().toISOString();

  try {
    const res = await fetch(`${base}/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        status: newStatus,
        status_timestamp: time
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to update status');
    }

    return await res.json();
  } catch (err) {
    console.error('Error updating job:', err);
    throw err;
  }
}


// Delete a job
export async function deleteJob(id, API_BASE_URL) {
  const base = getBaseUrl(API_BASE_URL);
  const res = await fetch(`${base}/jobs/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
  return true;
}

// PATCH job to 'In Progress'
export async function moveJobToInProgress(jobId, API_BASE_URL) {
  const base = getBaseUrl(API_BASE_URL);
  const timestamp = new Date().toISOString();

  try {
    const res = await fetch(`${base}/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        status: 'In Progress',
        contractor_status: 'In Progress',
        status_timestamp: timestamp,
        onsite_time: timestamp // <-- make sure this field exists in your DB
      }),
    });

    if (!res.ok) throw new Error(`Failed to move job to in progress: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error updating job status:', error);
    alert('Unable to update job status.');
  }
}

