// src/context/AppContext.js
import React, { createContext, useEffect, useRef, useReducer, useCallback } from 'react';
import { socket } from '../socket-client';

export const AppContext = createContext();

const getBaseUrl = (base) =>
  base ||
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname.includes('onrender.com')
    ? 'https://job-mamagement.onrender.com'
    : 'http://127.0.0.1:5000');

const initialState = { API_BASE_URL: getBaseUrl(), user: null, jobs: [], users: [], timezone: '' };
const reducer = (s, a) => ({ ...s, [a.type]: a.payload });

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const jobsRef = useRef(state.jobs);
  useEffect(() => { jobsRef.current = state.jobs; }, [state.jobs]);

  const fetchJobs = useCallback(async () => {
    try {
      const r = await fetch(`${state.API_BASE_URL}/jobs`, { credentials: 'include' });
      dispatch({ type: 'jobs', payload: r.ok ? await r.json() : [] });
    } catch (e) {
      console.error('Fetch jobs failed', e);
    }
  }, [state.API_BASE_URL]);

  const fetchUsers = useCallback(async () => {
    try {
      const r = await fetch(`${state.API_BASE_URL}/users`, { credentials: 'include' });
      if (r.ok) dispatch({ type: 'users', payload: await r.json() });
    } catch (e) {
      console.error('Fetch users failed', e);
    }
  }, [state.API_BASE_URL]);

  // initial load
  useEffect(() => {
    dispatch({ type: 'timezone', payload: Intl.DateTimeFormat().resolvedOptions().timeZone });
    fetchJobs(); fetchUsers();
  }, [fetchJobs, fetchUsers]);

  // socket-driven updates
  useEffect(() => {
    const onListChanged = () => fetchJobs();
    const onJobUpdated = (job) => {
      if (!job?.id) return;
      const list = jobsRef.current || [];
      const idx = list.findIndex(j => j.id === job.id);
      const next = idx >= 0 ? [...list.slice(0, idx), job, ...list.slice(idx + 1)] : [job, ...list];
      dispatch({ type: 'jobs', payload: next });
    };
    socket.on('job:list:changed', onListChanged);
    socket.on('job:updated', onJobUpdated);
    return () => {
      socket.off('job:list:changed', onListChanged);
      socket.off('job:updated', onJobUpdated);
    };
  }, [fetchJobs]);

  const set = (type) => (v) => dispatch({ type, payload: v });

  return (
    <AppContext.Provider value={{
      ...state,
      setUser: set('user'), setJobs: set('jobs'), setUsers: set('users'), setTimezone: set('timezone'),
      fetchJobs,                // still available for manual refresh
      restartPolling: () => {}  // no-op so existing calls don't crash
    }}>
      {children}
    </AppContext.Provider>
  );
}
