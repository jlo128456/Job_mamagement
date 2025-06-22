export function applyStatusColor(statusElement, status) {
  const colors = {
    "Pending": { background: "green", color: "white" },
    "In Progress": { background: "yellow", color: "black" },
    "Completed": { background: "red", color: "white" },
    "Completed - Pending Approval": { background: "orange", color: "white" },
  };

  const style = colors[status] || { background: "lightgray", color: "black" };
  statusElement.style.backgroundColor = style.background;
  statusElement.style.color = style.color;
}

