// utils.js

// ————————————————————————————————————————————————————————————————————————
// Imports
// ————————————————————————————————————————————————————————————————————————
import { loadData }      from './api.js';
import { showDashboard } from './dashboard/index.js';
import { G }             from './globals.js';

// ————————————————————————————————————————————————————————————————————————
// Detect user’s browser timezone once
// ————————————————————————————————————————————————————————————————————————
const USER_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

// ————————————————————————————————————————————————————————————————————————
// Get current time formatted for MySQL in UTC (YYYY-MM-DD HH:mm:ss)
// ————————————————————————————————————————————————————————————————————————
export function getNowUTCMySQL() {
  return formatForMySQLUTC(new Date().toISOString());
}

// ————————————————————————————————————————————————————————————————————————
// Format a given date (assumed UTC) for MySQL in UTC format
// ————————————————————————————————————————————————————————————————————————
export function formatForMySQLUTC(dateInput) {
  if (!dateInput) return null;

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;

  const year    = date.getUTCFullYear();
  const month   = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day     = String(date.getUTCDate()).padStart(2, "0");
  const hours   = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// ————————————————————————————————————————————————————————————————————————
// Convert UTC datetime to local display in DD-MM-YYYY HH:mm:ss
// ————————————————————————————————————————————————————————————————————————
export function formatForDisplayLocal(dateInput) {
  if (!dateInput) return "Not Logged";

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "Invalid Date";

  const parts = d.toLocaleString("en-AU", {
    timeZone: USER_TIME_ZONE,
    day:      "2-digit",
    month:    "2-digit",
    year:     "numeric",
    hour:     "2-digit",
    minute:   "2-digit",
    second:   "2-digit",
    hour12:   false
  }).split(", ");

  const [dd, mm, yyyy] = parts[0].split("/");
  const timePart       = parts[1];

  return `${dd}-${mm}-${yyyy} ${timePart}`;
}

// ————————————————————————————————————————————————————————————————————————
// Apply background/text colors based on job status
// ————————————————————————————————————————————————————————————————————————
export function applyStatusColor(el, status) {
  const map = {
    Pending:                         ['green',  'white'],
    'In Progress':                   ['yellow', 'black'],
    Completed:                       ['red',    'white'],
    'Completed - Pending Approval': ['orange', 'white'],
  };
  const [bg, fg] = map[status] || ['gray', 'black'];
  el.style.backgroundColor = bg;
  el.style.color           = fg;
}

// ————————————————————————————————————————————————————————————————————————
// Refresh all jobs and re-render dashboard
// ————————————————————————————————————————————————————————————————————————
export async function refreshAll() {
  await loadData();
  showDashboard(G.currentUserRole);
}
