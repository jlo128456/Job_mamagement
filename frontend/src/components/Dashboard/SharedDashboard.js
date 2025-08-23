import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import JobRow from "../Dashboard/JobRow";
import UpdateJobModal from "../UpdateJobModal/UpdateJobModal";
import { socket } from "../../socket-client";

function SharedDashboard({ role, onLogout, onComplete }) {
  const { user, jobs, fetchJobs } = useContext(AppContext);
  const [activeJobId, setActiveJobId] = useState(null);
  const [dismissedIds, setDismissedIds] = useState([]);

  useEffect(() => {
    fetchJobs(true);
    const onChange = () => fetchJobs(true);
    socket.on("job:updated", onChange);
    socket.on("job:list:changed", onChange);
    return () => {
      socket.off("job:updated", onChange);
      socket.off("job:list:changed", onChange);
    };
  }, [fetchJobs]);

  const handleDismiss = (id) => setDismissedIds((p) => [...p, id]);

  const filteredJobs = (Array.isArray(jobs) ? jobs : [])
    .filter(
      (j) =>
        (j.assigned_contractor === user?.id || j.assigned_tech === user?.id) &&
        !dismissedIds.includes(j.id)
    )
    .sort(
      (a, b) =>
        parseInt(a.work_order?.replace(/\D/g, ""), 10) -
        parseInt(b.work_order?.replace(/\D/g, ""), 10)
    );

  return (
    <div className="dashboard-container">
      <h2>{role === "contractor" ? "Contractor" : "Technician"} Dashboard</h2>
      <button className="logout-btn" onClick={onLogout}>Logout</button>
      <div className="table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              {["Work Order","Customer","Required Date","Status","Onsite Time","Updated","Actions"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr><td colSpan="7">No jobs found for this {role}.</td></tr>
            ) : (
              filteredJobs.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  refreshJobs={() => fetchJobs(true)}
                  onComplete={onComplete}
                  onOpenModal={() => setActiveJobId(job.id)}
                  onDismiss={() => handleDismiss(job.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      {activeJobId && (
        <UpdateJobModal
          jobId={activeJobId}
          onClose={() => {
            setActiveJobId(null);
            fetchJobs(true);
          }}
        />
      )}
    </div>
  );
}

export default SharedDashboard;
