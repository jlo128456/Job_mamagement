// Import React core tools for state and context
import React, { createContext, useState } from 'react';

// Create a new context object that can be used by components to access shared app state
export const AppContext = createContext();

// AppProvider is a context provider that wraps your whole app to make global state available
export function AppProvider({ children }) {
  // ─── Global state values ───────────────────────────
  const [user, setUser] = useState(null);                 // Logged-in user object
  const [userRole, setUserRole] = useState(null);         // Role: 'admin', 'contractor', or 'technician'
  const [jobs, setJobs] = useState([]);                   // List of all jobs
  const [users, setUsers] = useState([]);                 // List of all users
  const [pollingInterval, setPollingInterval] = useState(null); // For live polling jobs if needed

  // ─── Base API URL ───────────────────────────────────
  // Fallback to '/api' if REACT_APP_API_BASE_URL is not defined in .env
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';


  // ─── Provide context to the rest of the app ─────────
  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        userRole,
        setUserRole,
        jobs,
        setJobs,
        users,
        setUsers,
        pollingInterval,
        setPollingInterval,
        API_BASE_URL
      }}
    >
      {children} {/* Renders the nested components inside the provider */}
    </AppContext.Provider>
  );
}
