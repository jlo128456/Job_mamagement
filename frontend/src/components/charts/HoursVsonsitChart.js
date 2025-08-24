import React, { useMemo } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList
} from "recharts";

const num = (v) => (v == null ? 0 : typeof v === "number" ? v : parseFloat(String(v).match(/[\d.]+/)?.[0] || 0));
const toDate = (s) => (s ? new Date(s) : null);
const toHrs = (ms) => Math.max(0, ms / 36e5);

function aggregate(jobs = [], users = []) {
  const byId = new Map();
  const userById = new Map(users.map((u) => [u.id, u]));
  const now = new Date();

  const add = (uid, role, j) => {
    if (!uid) return;
    const u = userById.get(uid);
    const rec = byId.get(uid) || {
      name: u?.contractor || u?.email || `User ${uid}`, role, labourHours: 0, onsiteHours: 0
    };
    rec.labourHours += num(j.labour_hours ?? j.labour_time);
    const start = toDate(j.onsite_time);
    const end = toDate(j.completion_date) || toDate(j.status_timestamp) || now;
    if (start) rec.onsiteHours += toHrs(end - start);
    byId.set(uid, rec);
  };

  jobs.forEach((j) => {
    if (j.assigned_contractor) add(j.assigned_contractor, "contractor", j);
    if (j.assigned_tech) add(j.assigned_tech, "technician", j);
  });

  return [...byId.values()].sort((a, b) => (b.labourHours + b.onsiteHours) - (a.labourHours + a.onsiteHours));
}

const fmtHrs = (v) => `${(v ?? 0).toFixed(2)}h`;

export default function HoursVsOnsiteChart({ jobs, users }) {
  const data = useMemo(() => aggregate(jobs, users), [jobs, users]);
  const domainMax = Math.max(1, Math.ceil(Math.max(0, ...data.map(d => Math.max(d.labourHours, d.onsiteHours)))));

  return (
    <div style={{ padding: 12, borderRadius: 10, background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,.06)", marginTop: 16 }}>
      <h3 style={{ margin: "4px 0 10px" }}>Contractor / Technician: Hours vs Onsite</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-15} textAnchor="end" height={40} />
          <YAxis domain={[0, domainMax]} tickFormatter={(v) => `${v.toFixed(1)}`} />
          <Tooltip
            formatter={(v, k) => [fmtHrs(v), k === "labourHours" ? "Labour" : "Onsite"]}
            labelFormatter={(l) => `User: ${l}`}
          />
          <Legend />
          <Bar dataKey="labourHours" name="Labour (hrs)" fill="#6366f1" radius={[6,6,0,0]}>
            <LabelList dataKey="labourHours" formatter={(v) => (v ? v.toFixed(1) : "")} position="top" />
          </Bar>
          <Bar dataKey="onsiteHours" name="Onsite (hrs)" fill="#10b981" radius={[6,6,0,0]}>
            <LabelList dataKey="onsiteHours" formatter={(v) => (v ? v.toFixed(1) : "")} position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
    </div>
  );
}
