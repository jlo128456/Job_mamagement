console.log('main.js loaded');
import { G, fetchCsrfToken, fetchUser, logoutUser } from './globals.js';
import { showDashboard } from './dashboard/index.js';
import { loadData } from './api.js';

(async function init() {
  try {
    await fetchCsrfToken();
    console.log("CSRF token ready:", G.csrfToken);
  } catch (err) {
    console.error("Could not load CSRF token:", err);
  }

  const $ = id => document.getElementById(id);
  const loginForm  = $("loginForm");
  const logoutForm = $("logout-form");

  // LOGIN
  loginForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const email = $("email")?.value.trim();
    const password = $("password")?.value.trim();
    try {
      await fetchUser(email, password);
      G.currentUser = G.users[0];
      await fetchCsrfToken();
      await loadData();
      showDashboard(G.currentUserRole);
      loginForm.style.display = "none";
      logoutForm.style.display = "block";
    } catch (err) {
      alert("Login failed: " + err.message);
      console.error(err);
    }
  });

  // FORGOT PASSWORD (hardcoded modal)
  $("forgotPasswordBtn")?.addEventListener("click", e => {
    e.preventDefault();
    $("forgotPasswordModal").style.display = "flex";
  });

  $("sendResetLink")?.addEventListener("click", async () => {
    const email = $("resetEmail")?.value.trim();
    if (!email) return alert("Please enter your email.");
    try {
      const res = await fetch(`${G.API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      alert(res.ok ? "Reset link sent!" : "Failed to send reset link.");
      if (res.ok) $("forgotPasswordModal").style.display = "none";
    } catch (err) {
      alert("Reset error.");
      console.error(err);
    }
  });

  // SIGNUP (hardcoded modal)
  $("openSignup")?.addEventListener("click", e => {
    e.preventDefault();
    $("signupModal").style.display = "flex";
  });

  $("signupCancel")?.addEventListener("click", () => {
    $("signupModal").style.display = "none";
  });

  $("signupSubmit")?.addEventListener("click", async () => {
    const name = $("signupName")?.value.trim();
    const email = $("signupEmail")?.value.trim();
    const password = $("signupPassword")?.value.trim();
    if (!name || !email || !password) return alert("All fields required.");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      alert(res.ok ? "Account created!" : (data.message || "Signup failed."));
      if (res.ok) $("signupModal").style.display = "none";
    } catch (err) {
      alert("Signup error.");
      console.error(err);
    }
  });

  // LOGOUT
  logoutForm?.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      await logoutUser();
      logoutForm.style.display = "none";
      [G.adminView, G.contractorView, G.techView].forEach(v => v && (v.style.display = "none"));
      loginForm.style.display = "block";
    } catch (err) {
      alert("Logout error: " + err.message);
      console.error(err);
    }
  });
})();
