import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, setState] = useState({
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
    user: null,
    jobs: [],
    users: [],
    pollingInterval: null,
    timezone: '',
  });

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setState((prev) => ({ ...prev, timezone: tz }));
    console.log('User timezone detected:', tz);
  }, []);

  // 🔁 Poll every 10 sec to check for job updates
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${state.API_BASE_URL}/jobs`);
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setState((prev) => ({ ...prev, jobs: data }));
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    fetchJobs(); // Initial load

    const interval = setInterval(fetchJobs, 10000);
    setState((prev) => ({ ...prev, pollingInterval: interval }));

    return () => {
      clearInterval(interval);
      setState((prev) => ({ ...prev, pollingInterval: null }));
    };
  }, [state.API_BASE_URL]);

  const setters = {
    setUser: (user) => setState((s) => ({ ...s, user })),
    setJobs: (jobs) => setState((s) => ({ ...s, jobs })),
    setUsers: (users) => setState((s) => ({ ...s, users })),
    setPollingInterval: (interval) => setState((s) => ({ ...s, pollingInterval: interval })),
    setTimezone: (tz) => setState((s) => ({ ...s, timezone: tz })),
  };

  return (
    <AppContext.Provider value={{ ...state, ...setters }}>
      {children}
    </AppContext.Provider>
  );
}
