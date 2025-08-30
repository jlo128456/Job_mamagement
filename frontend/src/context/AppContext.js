// src/context/AppContext.js
import React, { createContext, useEffect, useRef, useReducer, useCallback } from 'react';
import { socket } from '../socket-client';

export const AppContext = createContext();

const PROD_API  = "https://job-mamagement.onrender.com";
const LOCAL_API = "http://127.0.0.1:5000";
const USE_LOCAL = process.env.REACT_APP_USE_LOCAL === "1";
const pickBase  = (base) =>
  (base || process.env.REACT_APP_API_BASE_URL || (USE_LOCAL ? LOCAL_API : PROD_API)).replace(/\/$/, '');

const initialState = { API_BASE_URL: pickBase(), user: null, jobs: [], users: [], timezone: '' };
const reducer = (s, a) => ({ ...s, [a.type]: a.payload });

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const jobsRef = useRef(state.jobs);
  useEffect(() => { jobsRef.current = state.jobs; }, [state.jobs]);

  const fetchJson = useCallback(async (path, opts) => {
    const res = await fetch(`${state.API_BASE_URL}${path}`, { credentials: 'include', ...opts });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  }, [state.API_BASE_URL]);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await fetchJson('/jobs');
      dispatch({ type: 'jobs', payload: Array.isArray(data) ? data : [] });
    } catch (e) { console.error('Fetch /jobs failed', e); }
  }, [fetchJson]);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await fetchJson('/users');
      dispatch({ type: 'users', payload: Array.isArray(data) ? data : [] });
    } catch (e) { console.error('Fetch /users failed', e); }
  }, [fetchJson]);

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
      const i = list.findIndex(j => j.id === job.id);
      const next = i >= 0 ? [...list.slice(0, i), job, ...list.slice(i + 1)] : [job, ...list];
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
      fetchJobs,
      restartPolling: () => {}
    }}>
      {children}
    </AppContext.Provider>
  );
}
