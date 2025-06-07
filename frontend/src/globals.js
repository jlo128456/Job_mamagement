// public/js/globals.js

export const G = {
  // ── App state ────────────────────────────────────────────────────────────
  users: [],              // logged-in user data
  jobs: [],               // fetched jobs list
  pollingInterval: null,  // interval ID if you poll for updates
  currentUserRole: null,  // “admin”, “contractor” or “tech”
  csrfToken: null,        // will hold our CSRF token

  // ── Dynamic DOM refs ─────────────────────────────────────────────────────
  get loginForm()         { return document.getElementById("loginForm"); },
  get logoutForm()        { return document.getElementById("logout-form"); },
  get adminView()         { return document.getElementById("adminView"); },
  get contractorView()    { return document.getElementById("contractorView"); },
  get contractorJobList() { return document.getElementById("contractorJobList"); },
  get adminJobList()      { return document.getElementById("adminJobList"); },
  get techView()          { return document.getElementById("techView"); },
  get techJobList()       { return document.getElementById("techJobList"); },

  // ── Base URLs (relative—same origin) ─────────────────────────────────────
  WEB_BASE_URL: "/",
  API_BASE_URL: "/api",
};

export async function fetchCsrfToken() {
  const res = await fetch(`${G.WEB_BASE_URL}csrf-token`, {
    credentials: "include",
    headers:     { "Accept":"application/json" },
  });
  if (!res.ok) throw new Error("Unable to fetch CSRF token");
  const { csrf_token } = await res.json();
  G.csrfToken = csrf_token;
  return csrf_token;
}

export async function csrfFetch(url, options = {}) {
  options = { credentials: "include", ...options };

  if (!G.csrfToken) {
    await fetchCsrfToken();
  }

  options.headers = {
    "Content-Type":     "application/json",
    "Accept":           "application/json",
    "X-CSRF-TOKEN":     G.csrfToken,
    "X-Requested-With": "XMLHttpRequest",
    ...(options.headers||{}),
  };

  let res = await fetch(url, options);

  if (res.status === 419) {
    // token expired—retry once
    await fetchCsrfToken();
    options.headers["X-CSRF-TOKEN"] = G.csrfToken;
    res = await fetch(url, options);
  }

  return res;
}

export async function fetchUser(email, password) {
  const res = await csrfFetch(
    `${G.WEB_BASE_URL}login`,
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
  if (res.status === 419) throw new Error("CSRF mismatch—please refresh.");
  if (!res.ok) throw new Error("Invalid email or password.");
  const { user } = await res.json();
  G.users = [user];
  G.currentUserRole = user.role;
}

export async function logoutUser() {
  try {
    const res = await csrfFetch(`${G.WEB_BASE_URL}logout`, { method: "POST" });

    if (res.status === 419) {
      throw new Error("CSRF mismatch—please refresh.");
    }

    const data = await res.json();

    if (!res.ok && data?.message !== 'No active session to log out.') {
      throw new Error("Logout failed.");
    }

    if (G.pollingInterval) clearInterval(G.pollingInterval);
    G.users = [];
    G.currentUserRole = null;

    console.log(data.message || "Logged out.");
  } catch (err) {
    console.warn("Logout warning:", err.message);
  }
}


// expose for quick console debugging
window.fetchCsrfToken = fetchCsrfToken;
window.csrfFetch     = csrfFetch;
window.G             = G;


