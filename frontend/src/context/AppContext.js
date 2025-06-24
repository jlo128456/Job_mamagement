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

function jobsChanged(newJobs, prevJobs) {
  return newJobs.length !== prevJobs.length || !newJobs.every((j, i) => {
    const o = prevJobs[i];
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
        if (stableCount.current >= 2) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          console.log('Polling stopped: no change in jobs');
        }
      }
    } catch (err) {
      console.error('Job fetch error:', err);
    }
  }, [state.API_BASE_URL, state.jobs]);

  const restartPolling = useCallback(() => {
    clearInterval(pollingRef.current);
    fetchJobs(true); // force fetch now
    pollingRef.current = setInterval(() => fetchJobs(), 5000); // poll every 5 sec
  }, [fetchJobs]);

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
    restartPolling,
  };

  return (
    <AppContext.Provider value={{ ...state, ...setters }}>
      {children}
    </AppContext.Provider>
  );
}
