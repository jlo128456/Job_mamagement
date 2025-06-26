// placeholder for timeUtils.js
export function formatForDisplayLocal(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
    //  No timeZone specified = use device default
    //  No timeZoneName = no AEST
  });
}
