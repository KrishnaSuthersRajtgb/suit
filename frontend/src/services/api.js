// If your backend isn't served from the same origin, set VITE_API_URL in
// your .env (e.g. "http://localhost:5000/api"), or set up a dev-server
// proxy and leave this as "/api".
const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
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
// Admin / Manager tabs — { username, password, plant } → { token, user }.
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

// ── Visitors ─────────────────────────────────────────────────────────────────
// Manager tab — approve/register a new visitor.
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

// ── Security tab ─────────────────────────────────────────────────────────────
// List today's manager-approved visitors, optionally filtered by plant
// and/or status. Response is { visitors, counts } — counts always reflect
// the full day+plant scope regardless of the status filter.
export const listVisitors = (plantCode, status) => {
  const params = new URLSearchParams();
  if (plantCode) params.set("plant", plantCode);
  if (status) params.set("status", status);
  const qs = params.toString();
  return request(qs ? `/visitors?${qs}` : "/visitors");
};

// Physical gate actions — only valid from certain visitor statuses
// (see backend/controllers/visitorController.js for the exact rules).
export const securityCheckIn = (id) => request(`/visitors/${id}/checkin`, { method: "POST" });
export const securityCheckOut = (id) => request(`/visitors/${id}/checkout`, { method: "POST" });
export const rejectVisitor = (id) => request(`/visitors/${id}/reject`, { method: "POST" });