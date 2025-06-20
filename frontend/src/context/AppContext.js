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
