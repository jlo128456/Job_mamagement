// src/utils/statusUtils.js
export function getStatusClass(status) {
  if (!status) return 'na';
  return status
    .toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/[^a-z\-]/g, '');  // Remove non-alpha characters
}