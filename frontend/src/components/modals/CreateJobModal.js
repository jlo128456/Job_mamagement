import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import CreateJobForm from "./CreateJobForm";

function CreateJobModal({ isOpen, onClose, onJobCreated }) {
  const { API_BASE_URL, jobs, setJobs, timezone } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [formData, setFormData] = useState({
    work_order: "", customer_name: "", customer_address: "",
    assigned_user_id: "", required_date: "", work_required: "", machines: []
  });

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      fetch(`${API_BASE_URL}/users/staff`).then(res => res.ok && res.json()),
      fetch(`${API_BASE_URL}/machines`).then(res => res.ok && res.json())
    ])
      .then(([u, m]) => { if (u) setUsers(u); if (m) setMachines(m); })
      .catch(console.error);
  }, [isOpen, API_BASE_URL]); // include API_BASE_URL

  useEffect(() => {
    if (!isOpen) return;
    const last = jobs
      .map(j => j.work_order)
      .filter(id => id?.startsWith("JM"))
      .map(id => parseInt(id.replace("JM", "")))
      .filter(n => !isNaN(n))
      .sort((a, b) => b - a)[0] || 10000;
    setFormData(f => ({ ...f, work_order: `JM${last + 1}` }));
  }, [isOpen, jobs]);

  const handleChange = (e) => {
    const { name, value, selectedOptions } = e.target;
    if (name === "machines") {
      const selected = Array.from(selectedOptions, o => o.value);
      setFormData(f => ({ ...f, machines: selected }));
    } else {
      setFormData(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = users.find(u => u.id === parseInt(formData.assigned_user_id));
    const payload = {
      ...formData,
      contractor: user?.contractor || "",
      role: user?.role || "",
      status: "Pending",
      timezone,
      assigned_contractor: user?.role === "contractor" ? user.id : null,
      assigned_tech: user?.role === "technician" ? user.id : null
    };

    try {
      const res = await fetch(`${API_BASE_URL}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      const newJob = await res.json();
      setJobs(p => [...p, newJob]);
      localStorage.setItem("jobUpdated", Date.now());
      onJobCreated?.();
      onClose();
      setFormData({ work_order: "", customer_name: "", customer_address: "", assigned_user_id: "", required_date: "", work_required: "", machines: [] });
    } catch {
      alert("Failed to create job.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <CreateJobForm
          formData={formData}
          users={users}
          machines={machines}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default CreateJobModal;
