// src/socket-client.js
import { io } from "socket.io-client";

const URL =
  process.env.REACT_APP_WS_URL ||
  (window.location.hostname.includes("onrender.com")
    ? "https://job-mamagement.onrender.com"
    : "http://localhost:5000");

export const socket = io(URL, {
  path: "/socket.io",          // explicit (default), helps behind proxies
  transports: ["websocket"],   // WS-only
  upgrade: false,
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,
  reconnectionDelayMax: 4000,  // backoff
  timeout: 5000,               // fail fast if backend is down
});

// handy helpers
export const joinJobRoom = (jobId) => socket.emit("job:join", { job_id: jobId });
export const on = (event, handler) => { socket.off(event, handler); socket.on(event, handler); };
export const once = (event, handler) => { const h = (...a)=>{ socket.off(event, h); handler(...a); }; socket.on(event, h); };

// optional: debug logs
socket.on("connect", () => console.log("WS connected", socket.id));
socket.on("disconnect", (r) => console.log("WS disconnected:", r));
socket.on("connect_error", (e) => console.warn("WS connect_error:", e.message));
