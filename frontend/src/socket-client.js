// src/socket-client.js
import { io } from "socket.io-client";

// 1) Explicit override wins (handy for staging/previews)
const ENV_URL = process.env.REACT_APP_WS_URL;

// 2) Feature flag to force local during dev
const USE_LOCAL = process.env.REACT_APP_USE_LOCAL === "1";

// 3) Hosts
const PROD_URL  = "https://job-mamagement.onrender.com"; // (typo intentional to match your service)
const LOCAL_URL = "http://127.0.0.1:5000";

// Treat any non-localhost host as production (Netlify, custom domain, etc.)
const isLocalHost = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

// Final URL selection (no trailing slash)
const URL = (ENV_URL || (USE_LOCAL || isLocalHost ? LOCAL_URL : PROD_URL)).replace(/\/$/, "");

export const socket = io(URL, {
  path: "/socket.io",
  // Prefer WS but allow polling fallback so it works behind strict proxies/CDNs
  transports: ["websocket", "polling"],
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
export const on = (event, handler) => { socket.off(event, handler); socket.on(event, handler); };
export const once = (event, handler) => {
  const h = (...a) => { socket.off(event, h); handler(...a); };
  socket.on(event, h);
};

// dev-only logs
if (process.env.NODE_ENV !== "production") {
  console.log("[socket] connecting to:", URL);
  socket.on("connect", () => console.log("WS connected", socket.id));
  socket.on("disconnect", (r) => console.log("WS disconnected:", r));
  socket.on("connect_error", (e) => console.warn("WS connect_error:", e.message));
}
