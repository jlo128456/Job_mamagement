// jobs.js
const PROD="https://job-mamagement.onrender.com", LOCAL="http://127.0.0.1:5000", USE_LOCAL=process.env.REACT_APP_USE_LOCAL==="1";
const getBaseUrl=(base)=>(base||process.env.REACT_APP_API_BASE_URL||(USE_LOCAL||/^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)?LOCAL:PROD)).replace(/\/$/,"");

async function jsonFetch(url, options={}) {
  const res = await fetch(url, { credentials:"include", headers:{ "Content-Type":"application/json", ...(options.headers||{}) }, ...options });
  if (!res.ok) { const txt=await res.text().catch(()=> ""); throw new Error(`${options.method||"GET"} ${url} → ${res.status} ${txt}`); }
  return res.json();
}

export async function loadData(API_BASE_URL){
  const base=getBaseUrl(API_BASE_URL);
  const [jobsRes, usersRes]=await Promise.all([
    fetch(`${base}/jobs/`, { credentials:"include" }),
    fetch(`${base}/users`,  { credentials:"include" }),
  ]);
  if(!jobsRes.ok||!usersRes.ok) throw new Error("Fetch failed");
  return { jobs: await jobsRes.json(), users: await usersRes.json() };
}

export async function updateJobStatus(id, overrideStatus=null, API_BASE_URL){
  const base=getBaseUrl(API_BASE_URL), now=new Date().toISOString();
  const job=await jsonFetch(`${base}/jobs/${id}`);
  let status=job.status, contractor_status=job.contractor_status;

  if(overrideStatus){
    if(overrideStatus==="Approved"||overrideStatus==="Completed"){ status="Completed"; contractor_status="Completed"; }
    else if(overrideStatus==="Rejected"){ status="In Progress"; contractor_status="Pending"; }
    else if(overrideStatus==="Pending"){ status="Pending"; contractor_status="Pending"; }
    else throw new Error("Invalid override status");
  }else{
    if(status==="Pending"){ status="In Progress"; contractor_status="In Progress"; }
    else if(status==="In Progress"){ status="Completed - Pending Approval"; contractor_status="Completed"; }
    else throw new Error("Cannot change job status further");
  }

  const payload={ status, contractor_status, status_timestamp:now };
  if(status==="In Progress"&&!job.onsite_time) payload.onsite_time=now;

  return jsonFetch(`${base}/jobs/${id}`, { method:"PATCH", body:JSON.stringify(payload) });
}

export async function moveJobToInProgress(jobId, API_BASE_URL){
  const base=getBaseUrl(API_BASE_URL), now=new Date().toISOString();
  return jsonFetch(`${base}/jobs/${jobId}`, {
    method:"PATCH",
    body:JSON.stringify({ status:"In Progress", contractor_status:"In Progress", status_timestamp:now, onsite_time:now }),
  });
}

export async function deleteJob(id, API_BASE_URL){
  const base=getBaseUrl(API_BASE_URL);
  const res=await fetch(`${base}/jobs/${id}`, { method:"DELETE", credentials:"include" });
  if(!res.ok) throw new Error("Delete failed");
  return true;
}
