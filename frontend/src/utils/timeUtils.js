// placeholder for timeUtils.js
export function formatForDisplayLocal(timestamp) {
  const utc = new Date(timestamp);

  // Adjust from UTC to local time explicitly
  const local = new Date(utc.getTime() - utc.getTimezoneOffset() * 60000);

  return local.toLocaleString(undefined, {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}