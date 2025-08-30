// src/api/metrics.js
const PROD = "https://job-mamagement.onrender.com";   // Render backend
const LOCAL = "http://127.0.0.1:5000";
const USE_LOCAL = process.env.REACT_APP_USE_LOCAL === "1";

const trim = (s) => s.replace(/\/+$/, "");
const getBaseUrl = (base) =>
  trim(base || process.env.REACT_APP_API_BASE_URL || (USE_LOCAL ? LOCAL : PROD));

export async function fetchHoursMetrics({ from, to, API_BASE_URL } = {}) {
  const base = getBaseUrl(API_BASE_URL);
  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const q = qs.toString();
  const res = await fetch(`${base}/metrics/hours${q ? `?${q}` : ""}`, { credentials: "include" });
  if (!res.ok) throw new Error(`GET /metrics/hours → ${res.status}`);
  return res.json();
}
