// placeholder for timeUtils.js
export function formatForDisplayLocal(isoString) {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString(); // You can customise format as needed
}