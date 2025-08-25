// src/api/metrics.js
const getBaseUrl = (base) =>
  base ||
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname.includes("onrender.com")
    ? "https://job-mamagement.onrender.com"
    : "http://127.0.0.1:5000");

export async function fetchHoursMetrics({ from, to, API_BASE_URL } = {}) {
  const base = getBaseUrl(API_BASE_URL);
  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const res = await fetch(`${base}/metrics/hours?${qs}`, { credentials: "include" });
  if (!res.ok) throw new Error(`GET /metrics/hours → ${res.status}`);
  return res.json(); // expect [{user_id, role, day, labour_hours, onsite_hours, user_name?}, ...]
}
