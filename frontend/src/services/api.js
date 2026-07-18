// If your backend isn't served from the same origin, set VITE_API_URL in
// your .env (e.g. "http://localhost:5000/api"), or set up a dev-server
// proxy and leave this as "/api".
const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  // Attach the staff JWT automatically, if we have one. Visitor check-in
  // never sets "ehs_token", so this is a no-op for that flow.
  const token = localStorage.getItem("ehs_token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ── Plants ───────────────────────────────────────────────────────────────────
// Populates the Plant dropdown on the login page.
export const getPlants = () => request("/plants");

// ── Auth ─────────────────────────────────────────────────────────────────────
// Admin / Manager / Security tabs — { username, password, plant } → { token, user }.
export const loginAdmin = (payload) =>
  request("/auth/admin/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginManager = (payload) =>
  request("/auth/manager/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// NOTE: this assumes a POST /api/auth/security/login route on your backend,
// mirroring admin/manager login exactly (same request/response shape,
// { user: { role: "SECURITY", ... } }). If that route doesn't exist yet,
// add a matching controller — see the admin/manager ones as a template.
export const loginSecurity = (payload) =>
  request("/auth/security/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// Clears the stored staff session. Call this from a dashboard's Logout
// button, then navigate("/").
export const logoutAdmin = () => {
  localStorage.removeItem("ehs_token");
  localStorage.removeItem("ehs_user");
};

// ── Visitors ─────────────────────────────────────────────────────────────────
// Approve/register a new visitor — used by both the Manager and Admin
// dashboards.
export const registerVisitor = (payload) =>
  request("/visitors/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// Visitor tab — check in with just a phone number (app login, not the
// physical gate check-in below).
export const checkinVisitor = (phone) =>
  request("/visitors/checkin", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });

// Rehydrate a visitor record (e.g. after a page refresh).
export const getVisitor = (id) => request(`/visitors/${id}`);

// Submit the safety quiz result — server decides pass/fail.
export const submitAssessment = (id, score, total) =>
  request(`/visitors/${id}/assessment`, {
    method: "POST",
    body: JSON.stringify({ score, total }),
  });

// Issue (or idempotently re-fetch) the visitor pass.
export const issuePass = (id) =>
  request(`/visitors/${id}/pass`, { method: "POST" });

// ── Security tab / Admin dashboard ───────────────────────────────────────────
// List visitors, optionally filtered by plant and/or status. Response is
// { visitors, counts } — counts always reflect the full scope regardless of
// the status filter.
export const listVisitors = (plantCode, status) => {
  const params = new URLSearchParams();
  if (plantCode) params.set("plant", plantCode);
  if (status) params.set("status", status);
  const qs = params.toString();
  return request(qs ? `/visitors?${qs}` : "/visitors");
};

// Physical gate actions — only valid from certain visitor statuses
// (see backend/controllers/visitorController.js for the exact rules).
// Used by both the Security and Admin dashboards.
export const securityCheckIn = (id) => request(`/visitors/${id}/checkin`, { method: "POST" });
export const securityCheckOut = (id) => request(`/visitors/${id}/checkout`, { method: "POST" });
export const rejectVisitor = (id) => request(`/visitors/${id}/reject`, { method: "POST" });