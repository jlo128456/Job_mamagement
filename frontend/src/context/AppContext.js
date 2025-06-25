import React, { createContext, useEffect, useRef, useReducer, useCallback } from 'react';

export const AppContext = createContext();

const initialState = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  user: null, jobs: [], users: [], timezone: ''
};

function reducer(state, action) {
  return { ...state, [action.type]: action.payload };
}

function jobsChanged(a, b) {
  return a.length !== b.length || !a.every((j, i) =>
    j.id === b[i]?.id && j.status === b[i]?.status && j.status_timestamp === b[i]?.status_timestamp
  );
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const pollingRef = useRef(null), stable = useRef(0), last = useRef(null);

  const fetchJobs = useCallback(async (force = false) => {
    try {
      const res = await fetch(`${state.API_BASE_URL}/jobs`);
      const data = res.ok ? await res.json() : [];
      if (force || jobsChanged(data, state.jobs)) {
        dispatch({ type: 'jobs', payload: data });
        stable.current = 0;
      } else if (++stable.current >= 2) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        console.log('Polling stopped: no job changes');
      }
    } catch (e) { console.error('Fetch error:', e); }
  }, [state.API_BASE_URL, state.jobs]);

  const restartPolling = useCallback(() => {
    clearInterval(pollingRef.current);
    stable.current = 0; last.current = null;
    const poll = async () => {
      try {
        const res = await fetch(`${state.API_BASE_URL}/jobs`);
        const data = res.ok ? await res.json() : [];
        if (!last.current || jobsChanged(data, last.current)) {
          dispatch({ type: 'jobs', payload: data });
          stable.current = 0;
          last.current = data;
        } else if (++stable.current >= 2) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          console.log('Polling stopped: no job changes');
        }
      } catch (e) { console.error('Polling error:', e); }
    };
    poll(); pollingRef.current = setInterval(poll, 5000);
  }, [state.API_BASE_URL]);

  useEffect(() => {
    dispatch({ type: 'timezone', payload: Intl.DateTimeFormat().resolvedOptions().timeZone });
  }, []);

  const set = (type) => (v) => dispatch({ type, payload: v });

  return (
    <AppContext.Provider value={{
      ...state,
      setUser: set('user'),
      setJobs: set('jobs'),
      setUsers: set('users'),
      setTimezone: set('timezone'),
      fetchJobs, restartPolling
    }}>
      {children}
    </AppContext.Provider>
  );
}
