import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [API_BASE_URL] = useState('http://127.0.0.1:5000'); // or env
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);
    console.log('🌍 User timezone detected:', tz);
  }, []);

  return (
    <AppContext.Provider
      value={{
        API_BASE_URL,
        user,
        setUser,
        jobs,
        setJobs,
        users,
        setUsers,
        timezone,
        setTimezone,
        pollingInterval,
        setPollingInterval
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
