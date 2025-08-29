// src/socket-client.js
import { io } from "socket.io-client";

// If you set REACT_APP_WS_URL, it wins (ideal for staging/preview envs)
const ENV_URL = process.env.REACT_APP_WS_URL;

// Your actual Render host (typo intentional to match your service)
const PROD_HOST = "job-mamagement.onrender.com";

// Auto-pick backend URL:
// - If ENV var provided → use it
// - If running on your Render domain → use your Render backend
// - Else → use local Flask dev
const URL =
  ENV_URL ||
  (window.location.hostname.endsWith(PROD_HOST)
    ? `https://${PROD_HOST}`
    : "http://localhost:5000");

export const socket = io(URL, {
  path: "/socket.io",
  // Prefer WebSocket but allow fallback to polling if needed
  transports: ["websocket"],
  upgrade: true,
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,
  reconnectionDelayMax: 4000,
  timeout: 5000,
});

// helpers
export const joinJobRoom = (jobId) => {
  if (!socket.connected) socket.connect();
  socket.emit("job:join", { job_id: jobId });
};

export const on = (event, handler) => {
  socket.off(event, handler);
  socket.on(event, handler);
};

export const once = (event, handler) => {
  const h = (...a) => {
    socket.off(event, h);
    handler(...a);
  };
  socket.on(event, h);
};

// dev-only logs
if (process.env.NODE_ENV === "development") {
  socket.on("connect", () => console.log("WS connected", socket.id));
  socket.on("disconnect", (r) => console.log("WS disconnected:", r));
  socket.on("connect_error", (e) => console.warn("WS connect_error:", e.message));
}
