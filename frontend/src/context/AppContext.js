import React, { createContext, useEffect, useRef, useReducer } from 'react';

export const AppContext = createContext();

const initialState = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  user: null,
  jobs: [],
  users: [],
  timezone: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER': return { ...state, user: action.payload };
    case 'SET_JOBS': return { ...state, jobs: action.payload };
    case 'SET_USERS': return { ...state, users: action.payload };
    case 'SET_TIMEZONE': return { ...state, timezone: action.payload };
    default: return state;
  }
}

function jobsAreDifferent(a, b) {
  return a.length !== b.length || !a.every((j, i) => {
    const o = b[i];
    return j.id === o?.id && j.status === o?.status && j.assigned_user_id === o?.assigned_user_id;
  });
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const pollingIntervalRef = useRef(null), pollingStarted = useRef(false), unchangedCount = useRef(0);

  useEffect(() => {
    dispatch({ type: 'SET_TIMEZONE', payload: Intl.DateTimeFormat().resolvedOptions().timeZone });
  }, []);

  useEffect(() => {
    if (pollingStarted.current) return;
    pollingStarted.current = true;

    const fetchJobs = async () => {
      try {
        const res = await fetch(`${state.API_BASE_URL}/jobs`);
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        if (jobsAreDifferent(data, state.jobs)) {
          unchangedCount.current = 0;
          console.log('Jobs changed, updating.');
          dispatch({ type: 'SET_JOBS', payload: data });
        } else {
          unchangedCount.current++;
          console.log('Jobs unchanged. Count:', unchangedCount.current);
          if (unchangedCount.current >= 1) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            pollingStarted.current = false;
            console.log('Polling paused.');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    fetchJobs();
    pollingIntervalRef.current = setInterval(fetchJobs, 30000);

    return () => {
      clearInterval(pollingIntervalRef.current);
      pollingStarted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setters = {
    setUser: (v) => dispatch({ type: 'SET_USER', payload: v }),
    setJobs: (v) => dispatch({ type: 'SET_JOBS', payload: v }),
    setUsers: (v) => dispatch({ type: 'SET_USERS', payload: v }),
    setTimezone: (v) => dispatch({ type: 'SET_TIMEZONE', payload: v }),
  };

  return (
    <AppContext.Provider value={{ ...state, ...setters }}>
      {children}
    </AppContext.Provider>
  );
}
