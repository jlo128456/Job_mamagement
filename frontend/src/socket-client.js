// src/socket-client.js
import { io } from "socket.io-client";

const URL =
  process.env.REACT_APP_WS_URL || "http://localhost:5000"; // your Flask-SocketIO URL

export const socket = io(URL, {
  transports: ["websocket"],   // WebSocket-only (no polling)
  upgrade: false,
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,
  // auth: { token: localStorage.getItem("token") } // <- if you pass auth
});

// optional helpers
export const joinJobRoom = (jobId) => socket.emit("job:join", { job_id: jobId });

// safe subscription helper to avoid duplicate handlers during HMR
export const on = (event, handler) => {
  socket.off(event, handler);
  socket.on(event, handler);
};
