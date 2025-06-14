// Utility: fallback for API base URL
const getBaseUrl = (base) => base || process.env.REACT_APP_API || 'http://127.0.0.1:5000';

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
export async function updateJobStatus(id, currentStatus, API_BASE_URL, overrideStatus = null) {
  const base = getBaseUrl(API_BASE_URL);
  try {
    const jobRes = await fetch(`${base}/jobs/${id}`);
    if (!jobRes.ok) throw new Error('Job not found');
    const job = await jobRes.json();

    const time = new Date().toISOString();
    let status = overrideStatus || job.status;
    let contractorStatus = job.contractor_status;

    if (!overrideStatus) {
      if (status === 'Pending') {
        status = 'In Progress';
        contractorStatus = 'In Progress';
      } else if (status === 'In Progress') {
        status = 'Completed - Pending Approval';
        contractorStatus = 'Completed';
      } else {
        throw new Error('Cannot change job status further.');
      }
    }

    const updatedJob = {
      ...job,
      status,
      contractor_status: contractorStatus,
      status_timestamp: time,
    };

    const putRes = await fetch(`${base}/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedJob),
    });

    if (!putRes.ok) throw new Error('Update failed');
    return await putRes.json();
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
  try {
    const res = await fetch(`${base}/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'In Progress' }),
    });

    if (!res.ok) {
      throw new Error(`Failed to move job to in progress: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error updating job status:', error);
    alert('Unable to update job status.');
  }
}
