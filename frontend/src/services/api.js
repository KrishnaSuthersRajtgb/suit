// If your backend isn't served from the same origin, point this at it directly,
// e.g. "http://localhost:5000/api" — or set up a dev-server proxy instead.
const API_BASE = "/api";

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

// Security tab — register a new visitor.
export const registerVisitor = (payload) =>
  request("/visitors/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// Visitor tab — check in with just a phone number.
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