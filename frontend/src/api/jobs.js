const getBaseUrl = (base) => base || process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';

export async function loadData(API_BASE_URL) {
  const base = getBaseUrl(API_BASE_URL);
  try {
    const [jobsRes, usersRes] = await Promise.all([
      fetch(`${base}/jobs`),
      fetch(`${base}/users`)
    ]);
    if (!jobsRes.ok || !usersRes.ok) throw new Error('Fetch failed');
    return { jobs: await jobsRes.json(), users: await usersRes.json() };
  } catch (error) {
    console.error('Error loading data:', error);
    return { jobs: [], users: [] };
  }
}

export async function updateJobStatus(id, overrideStatus = null, API_BASE_URL) {
  const base = getBaseUrl(API_BASE_URL);
  try {
    const jobRes = await fetch(`${base}/jobs/${id}`);
    if (!jobRes.ok) throw new Error('Job not found');
    const job = await jobRes.json();

    const now = new Date().toISOString();
    let status = job.status, contractorStatus = job.contractor_status;

    if (overrideStatus) {
      if (['Approved', 'Completed'].includes(overrideStatus)) {
        status = 'Completed';
        contractorStatus = 'Completed';
      } else if (['Pending', 'Rejected'].includes(overrideStatus)) {
        status = 'Pending';
        contractorStatus = 'Pending';
      } else {
        throw new Error('Invalid override status');
      }
    } else {
      if (status === 'Pending') {
        status = 'In Progress';
        contractorStatus = 'In Progress';
      } else if (status === 'In Progress') {
        status = 'Completed - Pending Approval';
        contractorStatus = 'Completed';
      } else {
        throw new Error('Cannot change job status further');
      }
    }

    const res = await fetch(`${base}/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...job, status, contractor_status: contractorStatus, status_timestamp: now })
    });

    if (!res.ok) throw new Error('Update failed');
    return await res.json();
  } catch (err) {
    console.error('Error updating job:', err);
    throw err;
  }
}

export async function deleteJob(id, API_BASE_URL) {
  const base = getBaseUrl(API_BASE_URL);
  const res = await fetch(`${base}/jobs/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
  return true;
}

export async function moveJobToInProgress(jobId, API_BASE_URL) {
  const base = getBaseUrl(API_BASE_URL);
  const now = new Date().toISOString();
  try {
    const res = await fetch(`${base}/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        status: 'In Progress',
        contractor_status: 'In Progress',
        status_timestamp: now,
        onsite_time: now
      })
    });
    if (!res.ok) throw new Error(`Failed to move job to in progress: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error updating job status:', error);
    alert('Unable to update job status.');
  }
}
