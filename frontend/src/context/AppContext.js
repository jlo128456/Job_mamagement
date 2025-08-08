import React, { createContext, useEffect, useRef, useReducer, useCallback } from 'react';
export const AppContext = createContext();

const getBaseUrl = (base) =>
  base ||
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname.includes("onrender.com")
    ? "https://job-mamagement.onrender.com"
    : "http://127.0.0.1:5000");

const initialState = { API_BASE_URL: getBaseUrl(), user: null, jobs: [], users: [], timezone: '' };
const reducer = (s, a) => ({ ...s, [a.type]: a.payload });
const jobsChanged = (a, b) => a.length !== b.length || !a.every((j, i) =>
  j.id === b[i]?.id && j.status === b[i]?.status && j.status_timestamp === b[i]?.status_timestamp
);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const pollingRef = useRef(null), stable = useRef(0), last = useRef(null);

  const pollJobs = useCallback(async (force = false) => {
    try {
      const res = await fetch(`${state.API_BASE_URL}/jobs`);
      const data = res.ok ? await res.json() : [];
      if (force || !last.current || jobsChanged(data, last.current)) {
        dispatch({ type: 'jobs', payload: data }); stable.current = 0; last.current = data;
      } else if (++stable.current >= 2) {
        clearInterval(pollingRef.current); pollingRef.current = null;
        console.log('Polling stopped: no job changes');
      }
    } catch (e) { console.error('Fetch error:', e); }
  }, [state.API_BASE_URL]);

  const restartPolling = useCallback(() => {
    clearInterval(pollingRef.current); stable.current = 0; last.current = null;
    const poll = () => pollJobs();
    poll(); pollingRef.current = setInterval(poll, 5000);
  }, [pollJobs]);

  useEffect(() => dispatch({
    type: 'timezone', payload: Intl.DateTimeFormat().resolvedOptions().timeZone
  }), []);

  const set = (type) => (v) => dispatch({ type, payload: v });

  return (
    <AppContext.Provider value={{
      ...state,
      setUser: set('user'), setJobs: set('jobs'), setUsers: set('users'),
      setTimezone: set('timezone'), fetchJobs: pollJobs, restartPolling
    }}>
      {children}
    </AppContext.Provider>
  );
}
