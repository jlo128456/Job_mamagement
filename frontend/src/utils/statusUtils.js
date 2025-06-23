// src/utils/statusUtils.js
export function getStatusClass(status) {
  if (!status) return 'na';
  return status
    .toLowerCase()
    .replace(/[\s_]+/g, '-')        // Replace spaces and underscores with single hyphen
    .replace(/[^a-z0-9-]/g, '')     // Remove non-alphanumerics except hyphen
    .replace(/--+/g, '-')           // Collapse multiple hyphens
    .trim();
}
