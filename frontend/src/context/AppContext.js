import React, { createContext, useEffect, useRef, useReducer, useCallback } from 'react';

export const AppContext = createContext();

const initialState = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  user: null,
  jobs: [],
  users: [],
  timezone: '',
};

function reducer(state, action) {
  return { ...state, [action.type]: action.payload };
}

function jobsChanged(a, b) {
  return a.length !== b.length || !a.every((j, i) => {
    const o = b[i];
    return j.id === o?.id && j.status === o?.status && j.status_timestamp === o?.status_timestamp;
  });
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const pollingRef = useRef(null);
  const stableCount = useRef(0);

  const fetchJobs = useCallback(async (force = false) => {
    try {
      const res = await fetch(`${state.API_BASE_URL}/jobs`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();

      if (force || jobsChanged(data, state.jobs)) {
        dispatch({ type: 'jobs', payload: data });
        stableCount.current = 0;
      } else {
        stableCount.current++;
        if (stableCount.current >= 1) {
          clearInterval(pollingRef.current);
        }
      }
    } catch (err) {
      console.error('Job fetch error:', err);
    }
  }, [state.API_BASE_URL, state.jobs]);

  const triggerJobRefresh = () => {
    clearInterval(pollingRef.current);
    fetchJobs(true); // force update now
    pollingRef.current = setInterval(() => fetchJobs(), 30000); // poll for short time to catch backend update
    setTimeout(() => clearInterval(pollingRef.current), 10000); // auto stop polling after 10s
  };

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    dispatch({ type: 'timezone', payload: tz });
  }, []);

  const setters = {
    setUser: (v) => dispatch({ type: 'user', payload: v }),
    setJobs: (v) => dispatch({ type: 'jobs', payload: v }),
    setUsers: (v) => dispatch({ type: 'users', payload: v }),
    setTimezone: (v) => dispatch({ type: 'timezone', payload: v }),
    fetchJobs,
    triggerJobRefresh, // 🔁 call this from onsite/approve/etc buttons
  };

  return (
    <AppContext.Provider value={{ ...state, ...setters }}>
      {children}
    </AppContext.Provider>
  );
}
