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
// button, then navigate("/site").
export const logoutAdmin = () => {
  localStorage.removeItem("ehs_token");
  localStorage.removeItem("ehs_user");
};

// ── Visitors ─────────────────────────────────────────────────────────────────
// Invite/register a new visitor — used by both the Manager and Admin
// dashboards. Creates the record at status INVITED — it will NOT appear in
// Security's gate queue until induction + assessment + pass are done.
export const registerVisitor = (payload) =>
  request("/visitors/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// Visitor tab — check in with just a phone number (app login, not the
// physical gate check-in below). First login moves INVITED → INDUCTION_STARTED.
export const checkinVisitor = (phone) =>
  request("/visitors/checkin", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });

// Rehydrate a visitor record (e.g. after a page refresh).
export const getVisitor = (id) => request(`/visitors/${id}`);

// ── Induction (SafetyAssessment page) ───────────────────────────────────────
// Two separate calls, matching the two pipeline stages:
//   1. markVideoComplete   → INDUCTION_STARTED → VIDEO_COMPLETED
//   2. submitQuiz          → VIDEO_COMPLETED → ASSESSMENT_PASSED | FAILED_ASSESSMENT
// Both hit the same endpoint with a `stage` flag, per visitorController.js.
export const markVideoComplete = (id) =>
  request(`/visitors/${id}/assessment`, {
    method: "POST",
    body: JSON.stringify({ stage: "video" }),
  });

// Returns { visitor, passed }. `passed` is authoritative — always trust it
// over guessing from score/total on the client.
export const submitQuiz = (id, score, total) =>
  request(`/visitors/${id}/assessment`, {
    method: "POST",
    body: JSON.stringify({ stage: "quiz", score, total }),
  });

// Issue the visitor pass — only valid once status is ASSESSMENT_PASSED.
// ASSESSMENT_PASSED → PASS_GENERATED.
export const issuePass = (id) =>
  request(`/visitors/${id}/pass`, { method: "POST" });

// ── Security tab / Admin dashboard ───────────────────────────────────────────
// List visitors, optionally filtered by plant and/or status. Response is
// { visitors, counts }.
//
// By default only gate-relevant statuses are returned (PASS_GENERATED,
// CHECKED_IN, CHECKED_OUT, CLOSED, REJECTED, EXPIRED, CANCELLED) — a
// Manager's invite alone will NOT show up here. Pass includePipeline=true
// to additionally see pre-gate visitors (Invited, Induction Started, etc.)
// for visibility — those are read-only on the Security dashboard.
//
// Pass includeAll=true (used by Admin) to see every status across every
// date — the default query also scopes active-status visitors to today,
// which Admin needs to bypass to see full history.
export const listVisitors = (plantCode, status, includePipeline, includeAll) => {
  const params = new URLSearchParams();
  if (plantCode) params.set("plant", plantCode);
  if (status) params.set("status", status);
  if (includePipeline) params.set("includePipeline", "true");
  if (includeAll) params.set("includeAll", "true");
  const qs = params.toString();
  return request(qs ? `/visitors?${qs}` : "/visitors");
};

// Physical gate actions — only valid from certain visitor statuses
// (see backend/controllers/visitorController.js TRANSITIONS for exact rules).
// Used by both the Security and Admin dashboards.
export const securityCheckIn = (id) => request(`/visitors/${id}/checkin`, { method: "POST" });   // PASS_GENERATED → CHECKED_IN
export const securityCheckOut = (id) => request(`/visitors/${id}/checkout`, { method: "POST" }); // CHECKED_IN → CHECKED_OUT
export const closeVisitor = (id) => request(`/visitors/${id}/close`, { method: "POST" });        // CHECKED_OUT → CLOSED
export const rejectVisitor = (id, reason) =>
  request(`/visitors/${id}/reject`, {
    method: "POST",
    body: JSON.stringify(reason ? { reason } : {}),
  });

// Manager/Admin — cancel an invite before the visitor arrives.
export const cancelVisitor = (id) => request(`/visitors/${id}/cancel`, { method: "POST" });

// ── Assessment questions (Admin manages, Visitor consumes) ──────────────────
// Public — used by the visitor-facing SafetyAssessment page. Returns only
// ACTIVE questions scoped to the visitor's plant (plus any global ones).
export const getActiveQuestions = (plantId) => {
  const qs = plantId ? `?plant=${plantId}` : "";
  return request(`/questions${qs}`);
};

// Admin-only — every question regardless of status, for the management panel.
export const getAllQuestions = (plantId) => {
  const qs = plantId ? `?plant=${plantId}` : "";
  return request(`/questions/all${qs}`);
};

export const createQuestion = (payload) =>
  request("/questions", { method: "POST", body: JSON.stringify(payload) });

export const updateQuestion = (id, payload) =>
  request(`/questions/${id}`, { method: "PUT", body: JSON.stringify(payload) });

export const deleteQuestion = (id) =>
  request(`/questions/${id}`, { method: "DELETE" });

// ── Induction video (Admin manages, Visitor consumes) ────────────────────────
// Public — the currently active video for a given plant (or the global one).
export const getActiveVideo = (plantId) => {
  const qs = plantId ? `?plant=${plantId}` : "";
  return request(`/video/active${qs}`);
};

// Admin-only — full history of videos, so the panel can show what was active before.
export const getAllVideos = () => request("/video/all");

// Admin-only — uploading a new URL here deactivates the previous active video
// in the same scope (global or that plant) automatically on the backend.
export const createVideo = (payload) =>
  request("/video", { method: "POST", body: JSON.stringify(payload) });

// ── Staff accounts (Admin creates Security/Manager logins) ──────────────────
export const listStaff = (role, plantId) => {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (plantId) params.set("plant", plantId);
  const qs = params.toString();
  return request(qs ? `/users/staff?${qs}` : "/users/staff");
};

export const createStaff = (payload) =>
  request("/users/staff", { method: "POST", body: JSON.stringify(payload) });