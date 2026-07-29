import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPlants,
  listVisitors,
  registerVisitor,
  securityCheckIn,
  securityCheckOut,
  closeVisitor,
  rejectVisitor,
  logoutAdmin,
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllVideos,
  createVideo,
  listStaff,
  createStaff,
} from "../services/api";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M10 12.5a.75.75 0 01-.53-.22l-3.5-3.5a.75.75 0 111.06-1.06L9.25 9.94V3a.75.75 0 011.5 0v6.94l2.22-2.22a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-.53.22z" />
    <path d="M4 13a.75.75 0 01.75.75v1.5c0 .414.336.75.75.75h9a.75.75 0 00.75-.75v-1.5a.75.75 0 011.5 0v1.5A2.25 2.25 0 0114.5 17.5h-9A2.25 2.25 0 013.25 15.25v-1.5A.75.75 0 014 13z" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M6 10a.75.75 0 01.75-.75h9.19l-2.22-2.22a.75.75 0 111.06-1.06l3.5 3.5a.75.75 0 010 1.06l-3.5 3.5a.75.75 0 11-1.06-1.06l2.22-2.22H6.75A.75.75 0 016 10z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M10 3a.75.75 0 01.75.75v5.5h5.5a.75.75 0 010 1.5h-5.5v5.5a.75.75 0 01-1.5 0v-5.5h-5.5a.75.75 0 010-1.5h5.5v-5.5A.75.75 0 0110 3z" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M9.25 3.5A2.25 2.25 0 007 1.25H4.25A2.25 2.25 0 002 3.5v11a1.5 1.5 0 001.5 1.5H7a2 2 0 012 2V3.5z" />
    <path d="M10.75 3.5A2.25 2.25 0 0113 1.25h2.75A2.25 2.25 0 0118 3.5v11a1.5 1.5 0 01-1.5 1.5H13a2 2 0 00-2 2V3.5z" />
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M2 5.5A1.5 1.5 0 013.5 4h7A1.5 1.5 0 0112 5.5v9a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 012 14.5v-9z" />
    <path d="M13.5 8.379l3.116-2.08A.75.75 0 0118 6.92v6.161a.75.75 0 01-1.384.42L13.5 11.62V8.38z" />
  </svg>
);

const ChevronDownIcon = ({ open }) => (
  <svg
    viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
  >
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M7 8a3 3 0 100-6 3 3 0 000 6z" />
    <path d="M14 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path fillRule="evenodd" d="M1.5 16.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5a.75.75 0 01-.75.75h-9.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    <path d="M13.5 11.75c2.108.377 3.75 2.164 3.75 4.4a.75.75 0 01-.75.75h-2a.75.75 0 01-.75-.75c0-1.53-.55-2.93-1.464-4.02.406-.24.847-.354 1.214-.38z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm10 6H4v8h12V8z" clipRule="evenodd" />
  </svg>
);

// ── Real backend statuses (see visitorController.js TRANSITIONS) ───────────
const STATUS_STYLES = {
  PASS_GENERATED: "bg-amber-500/20 text-amber-300 border-amber-700/50",
  CHECKED_IN:      "bg-emerald-500/20 text-emerald-300 border-emerald-700/50",
  CHECKED_OUT:     "bg-slate-700/50 text-slate-400 border-slate-600/50",
  CLOSED:          "bg-slate-800/70 text-slate-500 border-slate-700/50",
  REJECTED:        "bg-red-500/20 text-red-300 border-red-700/50",
  EXPIRED:         "bg-orange-500/20 text-orange-300 border-orange-700/50",
  CANCELLED:       "bg-slate-800/70 text-slate-500 border-slate-700/50",
};

const STATUS_LABELS = {
  PASS_GENERATED: "Awaiting Arrival",
  CHECKED_IN:      "Checked In",
  CHECKED_OUT:     "Checked Out",
  CLOSED:          "Closed",
  REJECTED:        "Rejected",
  EXPIRED:         "Expired",
  CANCELLED:       "Cancelled",
};

const STATUS_FILTERS = [
  { value: "",                label: "All" },
  { value: "PASS_GENERATED",  label: "Awaiting" },
  { value: "CHECKED_IN",      label: "Checked In" },
  { value: "CHECKED_OUT",     label: "Checked Out" },
  { value: "CLOSED",          label: "Closed" },
  { value: "REJECTED",        label: "Rejected" },
  { value: "EXPIRED",         label: "Expired" },
];

// Stat cards shown at the top — keep this list in sync with STATUS_FILTERS
// (minus "All") if you add/remove a status card.
const STAT_CARD_STATUSES = ["PASS_GENERATED", "CHECKED_IN", "CHECKED_OUT", "REJECTED"];

// Counts a status directly from a (already month/search-scoped) visitor
// array — replaces the old backend-`counts`-based countFor, since the
// backend's counts were never actually scoped to the selected month.
const countForStatus = (visitorsList, status) =>
  visitorsList.filter((v) => v.status === status).length;

// Both formatters below pin the timezone to IST explicitly — previously
// `toLocaleString(undefined, ...)` used whatever timezone the viewer's own
// browser/OS happened to be set to, so the exact same record could display
// a different date/time to admins logged in from different locations.
const fmtTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium" });
};

// Local YYYY-MM-DD for the date input's default value/min — avoids the UTC
// off-by-one day that toISOString() can introduce near midnight. Matches
// ManagerDashboard.jsx's InviteVisitorForm exactly.
const todayLocalISO = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
};

// ── Month navigator helpers ──────────────────────────────────────────────────
// Extracts a visitor's IST calendar year/month, independent of the viewer's
// own browser timezone — same reasoning as fmtTime/fmtDate above.
const getISTYearMonth = (dateVal) => {
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (Number.isNaN(d.getTime())) return null;
  // en-CA locale formats as YYYY-MM-DD, easy to split.
  const [year, month] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(d)
    .split("-");
  return { year: Number(year), month: Number(month) }; // month is 1–12
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Today / This Week / Custom Dates helpers — mirrors ManagerDashboard.jsx ──
const getISTDateISO = (dateVal) => {
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d); // "YYYY-MM-DD"
};

const getISTWeekRange = (dateVal) => {
  const todayISO = getISTDateISO(dateVal);
  const [y, m, d] = todayISO.split("-").map(Number);
  const anchor = new Date(Date.UTC(y, m - 1, d, 12)); // noon UTC avoids DST edge cases
  const dow = anchor.getUTCDay(); // 0 = Sun … 6 = Sat
  const monday = new Date(anchor);
  monday.setUTCDate(anchor.getUTCDate() + (dow === 0 ? -6 : 1 - dow));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const toISO = (dt) => dt.toISOString().slice(0, 10);
  return { start: toISO(monday), end: toISO(sunday) };
};

// Formats a plain "YYYY-MM-DD" string for display without going through
// Date parsing (avoids any timezone re-interpretation of a date-only value).
const fmtDateChip = (isoDate) => {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
};

// Local YYYY-MM-DD for the custom-date input's default value — matches
// ManagerDashboard.jsx's helper of the same name.
const todayLocalISOForFilter = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
};

// ── Field lookup ─────────────────────────────────────────────────────────────
const pickTime = (obj, paths) => {
  for (const path of paths) {
    const val = path.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), obj);
    if (val) return val;
  }
  return null;
};

const getRequestedTime = (v) => pickTime(v, ["invitedAt", "createdAt", "registeredAt"]);
const getCheckInTime   = (v) => pickTime(v, ["checkedInAt", "checkInAt", "checkinAt", "checkIn"]);
const getCheckOutTime  = (v) => pickTime(v, ["checkedOutAt", "checkOutAt", "checkoutAt", "checkOut"]);
const getVisitDate     = (v) => pickTime(v, ["visitDate"]);

// registeredBy may come back populated (e.g. { _id, username }) or as a raw
// ObjectId string, depending on whether the backend .populate()s it — handle
// both so the UI doesn't break either way. Mirrors ManagerDashboard.jsx.
const getRegisteredBy = (v) => {
  const rb = v.registeredBy;
  if (!rb) return "—";
  if (typeof rb === "string") return rb;
  return rb.username || rb.name || rb._id || "—";
};

// Turns a row into a safe CSV cell (quotes anything with a comma/quote/newline).
const csvCell = (val) => {
  const s = String(val ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// The Plant schema has no dedicated "organization" field — the company name
// is embedded at the start of `location` (e.g. "Kerakoll India Pvt. Ltd.
// Plot No 02-01, 01A & 62, ..."). Heuristic: cut right before "Plot" or the
// first digit (start of the plot/door number), whichever comes first.
// Fragile if a location string is formatted differently — falls back to ""
// rather than showing garbled text. Mirrors ManagerDashboard.jsx exactly.
const extractOrgFromLocation = (location) => {
  if (!location) return "";
  const match = location.match(/^(.*?)(?:\s*,?\s*Plot\b|\s+\d)/i);
  const org = match ? match[1] : "";
  return org.replace(/[,\s]+$/, "").trim();
};

// Shared small message boxes used by the new panels below.
const ErrorBox = ({ children }) => (
  <div className="bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">{children}</div>
);
const SuccessBox = ({ children }) => (
  <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm rounded-lg px-4 py-3">{children}</div>
);

const inputCls =
  "w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition";
const labelCls = "block text-sm font-medium text-slate-300 mb-1.5";

const plantNameFor = (plants, plantRefOrId) => {
  if (!plantRefOrId) return "All Plants";
  const id = typeof plantRefOrId === "object" ? plantRefOrId._id : plantRefOrId;
  return plants.find((p) => p._id === id)?.plantName || (typeof plantRefOrId === "object" ? plantRefOrId.plantName : "—") || "—";
};

// ─────────────────────────────────────────────────────────────────────────────
// ── Approve Visitor (inline, collapsible) ────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function ApproveVisitorForm({ plants, plantsLoading, plantsError, onApproved }) {
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [company, setCompany]     = useState("");
  const [purpose, setPurpose]     = useState("");
  const [host, setHost]           = useState("");
  const [plant, setPlant]         = useState("");
  const [visitDate, setVisitDate] = useState(todayLocalISO());
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim())    { setError("Full name is required."); return; }
    if (!phone.trim())   { setError("Phone number is required."); return; }
    if (!plant)          { setError("Plant is required."); return; }
    if (!purpose.trim()) { setError("Purpose of visit is required."); return; }
    if (!host.trim())    { setError("Host employee name is required."); return; }
    if (!visitDate)      { setError("Visit date is required."); return; }

    setLoading(true);
    try {
      const data = await registerVisitor({
        name: name.trim(), phone: phone.trim(), company: company.trim(),
        purpose, host: host.trim(), plant, visitDate,
      });
      setSuccess(data.message || "Visitor invited.");
      setName(""); setPhone(""); setCompany(""); setPurpose(""); setHost(""); setPlant("");
      setVisitDate(todayLocalISO());
      onApproved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text" placeholder="e.g. Arun Sharma" value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>
            Phone <span className="text-red-400">*</span>
          </label>
          <input
            type="tel" placeholder="+91 98765 43210" value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            Plant <span className="text-red-400">*</span>
          </label>
          <select
            value={plant} onChange={(e) => setPlant(e.target.value)}
            disabled={plantsLoading || !!plantsError}
            className={`${inputCls} disabled:opacity-60`}
          >
            <option value="">{plantsLoading ? "Loading…" : "Select plant…"}</option>
            {plants.map((p) => (
              <option key={p._id} value={p._id}>{p.plantName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>
            <span className="inline-flex items-center gap-1.5"><CalendarIcon /> Visit Date</span>{" "}
            <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={visitDate}
            min={todayLocalISO()}
            onChange={(e) => setVisitDate(e.target.value)}
            className={`${inputCls} [color-scheme:dark]`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Company / Organisation</label>
          <input
            type="text" placeholder="e.g. ABC Contractors Ltd" value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>
            Host Employee Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text" placeholder="Who are they visiting?" value={host}
            onChange={(e) => setHost(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>
          Purpose of Visit <span className="text-red-400">*</span>
        </label>
        <select
          value={purpose} onChange={(e) => setPurpose(e.target.value)}
          className={inputCls}
        >
          <option value="">Select purpose…</option>
          <option value="Safety Audit">Safety Audit</option>
          <option value="Site Inspection">Site Inspection</option>
          <option value="Contractor Work">Contractor Work</option>
          <option value="Delivery">Delivery</option>
          <option value="Meeting">Meeting</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}
      {success && <SuccessBox>{success}</SuccessBox>}

      <button
        type="submit" disabled={loading}
        className="w-full sm:w-auto bg-purple-500 hover:bg-purple-400 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-6 py-2.5 text-sm transition"
      >
        {loading ? "Inviting…" : "Invite Visitor"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Manage Assessment (Questions + Video) ────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function QuestionForm({ plants, existing, onSaved, onCancel }) {
  const isEdit = !!existing;
  const [text, setText]       = useState(existing?.question || "");
  const [options, setOptions] = useState(
    existing?.options?.length === 4 ? existing.options : ["", "", "", ""]
  );
  const [correct, setCorrect] = useState(existing?.correct ?? 0);
  const [plant, setPlant]     = useState(existing?.plant?._id || existing?.plant || "");
  const [order, setOrder]     = useState(existing?.order ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState("");

  const handleOptionChange = (idx, val) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!text.trim()) { setError("Question text is required."); return; }
    if (options.some((o) => !o.trim())) { setError("All 4 options are required."); return; }

    setSubmitting(true);
    try {
      const payload = {
        question: text.trim(),
        options: options.map((o) => o.trim()),
        correct,
        plant: plant || null,
        order: Number(order) || 0,
      };
      if (isEdit) {
        await updateQuestion(existing._id, payload);
      } else {
        await createQuestion(payload);
        setText(""); setOptions(["", "", "", ""]); setCorrect(0); setPlant(""); setOrder(0);
      }
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
      <div>
        <label className={labelCls}>
          Question <span className="text-red-400">*</span>
        </label>
        <input
          type="text" value={text} onChange={(e) => setText(e.target.value)}
          placeholder="e.g. What should you do before entering a restricted area?"
          className={inputCls}
        />
      </div>

      <div className="space-y-2.5">
        <label className={labelCls}>
          Options — select the correct one <span className="text-red-400">*</span>
        </label>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <input
              type="radio" name={`correct-${existing?._id || "new"}`} checked={correct === idx}
              onChange={() => setCorrect(idx)}
              className="w-4 h-4 accent-emerald-500 shrink-0"
            />
            <span className="text-xs font-semibold text-slate-500 w-4 shrink-0">
              {String.fromCharCode(65 + idx)}
            </span>
            <input
              type="text" value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + idx)}`}
              className={inputCls}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Scope (Plant)</label>
          <select value={plant} onChange={(e) => setPlant(e.target.value)} className={inputCls}>
            <option value="">All Plants</option>
            {plants.map((p) => (
              <option key={p._id} value={p._id}>{p.plantName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Display Order</label>
          <input
            type="number" value={order} onChange={(e) => setOrder(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      <div className="flex gap-2">
        <button
          type="submit" disabled={submitting}
          className="bg-purple-500 hover:bg-purple-400 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-5 py-2.5 text-sm transition"
        >
          {submitting ? "Saving…" : isEdit ? "Save Changes" : "Add Question"}
        </button>
        {isEdit && (
          <button
            type="button" onClick={onCancel}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg px-5 py-2.5 text-sm transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function QuestionRow({ q, plants, onEdit, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!window.confirm("Delete this question? This can't be undone.")) return;
    setDeleting(true);
    setError("");
    try {
      await deleteQuestion(q._id);
      onDeleted?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm">{q.question}</p>
          <p className="text-xs text-slate-500 mt-1">
            Scope: {plantNameFor(plants, q.plant)} · Order: {q.order} · {q.status}
          </p>
          <ul className="mt-2.5 space-y-1">
            {q.options.map((opt, i) => (
              <li
                key={i}
                className={`text-xs px-2.5 py-1 rounded-md ${
                  i === q.correct ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400"
                }`}
              >
                {String.fromCharCode(65 + i)}. {opt}
              </li>
            ))}
          </ul>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={onEdit}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-3 py-1.5 transition"
          >
            Edit
          </button>
          <button
            onClick={handleDelete} disabled={deleting}
            className="text-xs bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:cursor-not-allowed text-white rounded-lg px-3 py-1.5 transition"
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionsTab({ plants }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllQuestions();
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <QuestionForm plants={plants} onSaved={load} />

      {error && <ErrorBox>{error}</ErrorBox>}

      {loading ? (
        <p className="text-slate-500 text-sm text-center py-6">Loading questions…</p>
      ) : questions.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-6">
          No questions yet — add the first one above.
        </p>
      ) : (
        <div className="space-y-3">
          {questions.map((q) =>
            editingId === q._id ? (
              <QuestionForm
                key={q._id}
                plants={plants}
                existing={q}
                onSaved={() => { setEditingId(null); load(); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <QuestionRow
                key={q._id}
                q={q}
                plants={plants}
                onEdit={() => setEditingId(q._id)}
                onDeleted={load}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

function VideoTab({ plants }) {
  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [mode, setMode]       = useState("link");
  const [title, setTitle]     = useState("");
  const [url, setUrl]         = useState("");
  const [file, setFile]       = useState(null);
  const [plant, setPlant]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");
  const [success, setSuccess]       = useState("");

  const load = async () => {
    setLoading(true);
    setListError("");
    try {
      const data = await getAllVideos();
      setVideos(data);
    } catch (err) {
      setListError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModeChange = (next) => {
    setMode(next);
    setFormError("");
    if (next === "link") setFile(null);
    else setUrl("");
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 200 * 1024 * 1024) {
      setFormError("File is too large — max 200MB.");
      setFile(null);
      e.target.value = "";
      return;
    }
    setFormError("");
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    if (mode === "link" && !url.trim()) { setFormError("Video URL is required."); return; }
    if (mode === "upload" && !file)      { setFormError("Please choose a video file to upload."); return; }

    setSubmitting(true);
    try {
      await createVideo({
        title: title.trim(),
        plant: plant || null,
        url: mode === "link" ? url.trim() : undefined,
        file: mode === "upload" ? file : undefined,
      });
      setSuccess("Saved — this is now the active induction video for that scope.");
      setTitle(""); setUrl(""); setFile(null); setPlant("");
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Video Title</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Site Safety Induction"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Scope (Plant)</label>
            <select value={plant} onChange={(e) => setPlant(e.target.value)} className={inputCls}>
              <option value="">All Plants</option>
              {plants.map((p) => (
                <option key={p._id} value={p._id}>{p.plantName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Link vs. Upload toggle */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1 w-fit">
          <button
            type="button"
            onClick={() => handleModeChange("link")}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${
              mode === "link" ? "bg-purple-500 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Video Link
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("upload")}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${
              mode === "upload" ? "bg-purple-500 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Upload File
          </button>
        </div>

        {mode === "link" ? (
          <div>
            <label className={labelCls}>
              Video URL <span className="text-red-400">*</span>
            </label>
            <input
              type="text" value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://... .mp4, or a YouTube link"
              className={inputCls}
            />
          </div>
        ) : (
          <div>
            <label className={labelCls}>
              Video File <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              onChange={handleFileChange}
              className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-4 py-2.5 text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-400 file:cursor-pointer cursor-pointer transition"
            />
            {file && (
              <p className="text-xs text-slate-500 mt-1.5">
                {file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            )}
            <p className="text-xs text-slate-600 mt-1">MP4, WebM, OGG, or MOV — max 200MB.</p>
          </div>
        )}

        {formError && <ErrorBox>{formError}</ErrorBox>}
        {success && <SuccessBox>{success}</SuccessBox>}

        <button
          type="submit" disabled={submitting}
          className="bg-purple-500 hover:bg-purple-400 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-5 py-2.5 text-sm transition"
        >
          {submitting ? (mode === "upload" ? "Uploading…" : "Saving…") : "Set Active Video"}
        </button>
      </form>

      {listError && <ErrorBox>{listError}</ErrorBox>}

      {loading ? (
        <p className="text-slate-500 text-sm text-center py-6">Loading videos…</p>
      ) : videos.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-6">No video set yet.</p>
      ) : (
        <div className="space-y-2">
          {videos.map((v) => (
            <div
              key={v._id}
              className={`flex items-center justify-between gap-3 bg-slate-900 border rounded-xl px-4 py-3 ${
                v.isActive ? "border-emerald-700/50" : "border-slate-800"
              }`}
            >
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{v.title}</p>
                <p className="text-xs text-slate-500 break-all">{v.url}</p>
                <p className="text-xs text-slate-500 mt-0.5">Scope: {plantNameFor(plants, v.plant)}</p>
              </div>
              {v.isActive && (
                <span className="shrink-0 text-xs font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-700/50 px-2.5 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Create Staff (Security / Manager) ────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function CreateStaffPanel({ plants, plantsLoading, plantsError, fixedRole }) {
  const [staff, setStaff]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [listError, setListError] = useState("");

  const [username, setUsername]     = useState("");
  const [password, setPassword]     = useState("");
  const [role, setRole]             = useState(fixedRole || "SECURITY");
  const [fullName, setFullName]     = useState("");
  const [email, setEmail]           = useState("");
  const [phone, setPhone]           = useState("");
  const [plant, setPlant]           = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

  const loadStaff = async () => {
    setLoading(true);
    setListError("");
    try {
      const data = await listStaff();
      setStaff(data);
    } catch (err) {
      setListError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim()) { setError("Username is required."); return; }
    if (!password || password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!plant) { setError("Plant is required."); return; }

    setSubmitting(true);
    try {
      await createStaff({
        username: username.trim(),
        password,
        role,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        plant,
        employeeId: employeeId.trim(),
        department: department.trim(),
        designation: designation.trim(),
      });
      setSuccess(`${role === "MANAGER" ? "Manager" : "Security"} account created.`);
      setUsername(""); setPassword(""); setFullName(""); setEmail(""); setPhone("");
      setEmployeeId(""); setDepartment(""); setDesignation(""); setPlant("");
      loadStaff();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const displayedStaff = fixedRole ? staff.filter((s) => s.role === fixedRole) : staff;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              Role <span className="text-red-400">*</span>
            </label>
            {fixedRole ? (
              <div className={`${inputCls} flex items-center bg-slate-800/60 text-slate-300`}>
                {fixedRole === "MANAGER" ? "Manager" : "Security"}
              </div>
            ) : (
              <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
                <option value="SECURITY">Security</option>
                <option value="MANAGER">Manager</option>
              </select>
            )}
          </div>
          <div>
            <label className={labelCls}>
              Plant <span className="text-red-400">*</span>
            </label>
            <select
              value={plant} onChange={(e) => setPlant(e.target.value)}
              disabled={plantsLoading || !!plantsError}
              className={`${inputCls} disabled:opacity-60`}
            >
              <option value="">{plantsLoading ? "Loading…" : "Select plant…"}</option>
              {plants.map((p) => (
                <option key={p._id} value={p._id}>{p.plantName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              Username <span className="text-red-400">*</span>
            </label>
            <input
              type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. jsmith"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>
              Password <span className="text-red-400">*</span>
            </label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Full Name</label>
            <input
              type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Employee ID</label>
            <input
              type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input
              type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Department</label>
            <input
              type="text" value={department} onChange={(e) => setDepartment(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Designation</label>
            <input
              type="text" value={designation} onChange={(e) => setDesignation(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}
        {success && <SuccessBox>{success}</SuccessBox>}

        <button
          type="submit" disabled={submitting}
          className="w-full sm:w-auto bg-purple-500 hover:bg-purple-400 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-6 py-2.5 text-sm transition"
        >
          {submitting ? "Creating…" : `Create ${role === "MANAGER" ? "Manager" : "Security"} Account`}
        </button>
      </form>

      {listError && <ErrorBox>{listError}</ErrorBox>}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-slate-500 text-sm text-center py-8">Loading staff accounts…</p>
        ) : displayedStaff.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">
            {fixedRole === "MANAGER" ? "No Manager accounts yet." : fixedRole === "SECURITY" ? "No Security accounts yet." : "No Security/Manager accounts yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="text-left font-medium px-5 py-3">Username</th>
                  <th className="text-left font-medium px-5 py-3">Role</th>
                  <th className="text-left font-medium px-5 py-3">Plant</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {displayedStaff.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <p className="text-white font-medium">{s.username}</p>
                      {s.fullName && <p className="text-slate-500 text-xs mt-0.5">{s.fullName}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{s.role}</td>
                    <td className="px-5 py-3.5 text-slate-300">{s.plant?.plantName || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          s.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-700/50"
                            : "bg-slate-800 text-slate-500 border-slate-700/50"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();

  const [admin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ehs_user") || "null");
    } catch {
      return null;
    }
  });

  const [plants, setPlants]             = useState([]);
  const [plantsError, setPlantsError]   = useState("");

  const [plantFilter, setPlantFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");

 // Ribbon detail — shows the specifically-selected plant when one is picked
  // via the "All plants" dropdown below; otherwise defaults to the first
  // plant in the list, so the ribbon always shows Org · Code · Plant Name
  // rather than a generic "Admin Dashboard" label.
  const selectedPlantInfo = useMemo(() => {
    if (plantFilter) {
      return plants.find((p) => p._id === plantFilter) || null;
    }
    return plants[0] || null;
  }, [plantFilter, plants]);

  const selectedPlantOrgName = extractOrgFromLocation(selectedPlantInfo?.location);

  const [search, setSearch]             = useState("");

  const [selectedMonth, setSelectedMonth] = useState(() => getISTYearMonth(new Date()));
  const shiftMonth = (delta) => {
    setSelectedMonth((prev) => {
      let { year, month } = prev;
      month += delta;
      if (month < 1) { month = 12; year -= 1; }
      else if (month > 12) { month = 1; year += 1; }
      return { year, month };
    });
  };
  const goToCurrentMonth = () => setSelectedMonth(getISTYearMonth(new Date()));

  // Which date filter is active, and (for "custom") the set of individually-
  // picked dates. Mirrors ManagerDashboard.jsx exactly.
  const [dateFilterMode, setDateFilterMode] = useState("month"); // "today" | "week" | "month" | "custom"
  const [customDates, setCustomDates] = useState([]); // ["YYYY-MM-DD", ...]
  const [customDateInput, setCustomDateInput] = useState(todayLocalISOForFilter());

  const addCustomDate = () => {
    if (!customDateInput) return;
    setCustomDates((prev) => (prev.includes(customDateInput) ? prev : [...prev, customDateInput].sort()));
  };
  const removeCustomDate = (d) => setCustomDates((prev) => prev.filter((x) => x !== d));

  const [activePanel, setActivePanel] = useState(null);

  const ACTION_ITEMS = [
    { key: "visitor",  label: "Invite Visitor",     Icon: PlusIcon,  gradient: "from-sky-500 to-blue-600" },
    { key: "staff",    label: "Add User", Icon: UsersIcon, gradient: "from-violet-500 to-purple-600" },
    { key: "video",    label: "Add Video",          Icon: VideoIcon, gradient: "from-emerald-500 to-teal-600" },
    { key: "question", label: "Add Question",       Icon: BookIcon,  gradient: "from-orange-500 to-amber-600" },
  ];

  const selectActionPanel = (key) => {
    setActivePanel((prev) => (prev === key ? null : key));
  };

  const [visitors, setVisitors]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [actioningId, setActioningId]   = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("ehs_token")) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    getPlants()
      .then(setPlants)
      .catch((err) => setPlantsError(err.message));
  }, []);

  const loadVisitors = async (plantId) => {
    setLoading(true);
    setError("");
    try {
      // Admin needs full history, not just today's active-status records —
      // pass includeAll=true so the backend skips its today-only scoping
      // (that scoping still applies for Security's gate queue, unaffected).
      //
      // Status is deliberately NOT sent here — fetch every status for this
      // plant once, and filter by status/month/search entirely client-side
      // below. Previously sending status meant the stat-card counts
      // (data.counts) were computed only from whatever the backend returned,
      // which — combined with includeAll=true skipping date scoping —
      // reflected the visitor's ENTIRE history rather than the selected
      // month, so switching to a month with no visitors still showed stale
      // counts from other months.
      const data = await listVisitors(plantId || undefined, undefined, false, true);
      setVisitors(data.visitors);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logoutAdmin();
        navigate("/", { replace: true });
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors(plantFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantFilter]);

  const runAction = async (id, action) => {
    setActioningId(id);
    setError("");
    try {
      await action(id);
      await loadVisitors(plantFilter);
    } catch (err) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  // Scoped by search + the active date filter (NOT status) — feeds the stat
  // cards. "month" branch matches the original month-navigator behavior;
  // today/week/custom are additional filter modes. Mirrors
  // ManagerDashboard.jsx's dateScopedVisitors exactly.
  const dateScopedVisitors = useMemo(() => {
    const q = search.trim().toLowerCase();
    const todayISO = getISTDateISO(new Date());
    const weekRange = dateFilterMode === "week" ? getISTWeekRange(new Date()) : null;

    return visitors.filter((v) => {
      const matchesSearch =
        !q ||
        [v.name, v.phone, v.company, v.host, v.plant?.plantName]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q));
      if (!matchesSearch) return false;

      const dateVal = getVisitDate(v) || getRequestedTime(v);

      if (dateFilterMode === "today") {
        return dateVal ? getISTDateISO(dateVal) === todayISO : false;
      }

      if (dateFilterMode === "week") {
        if (!dateVal) return false;
        const iso = getISTDateISO(dateVal);
        return iso >= weekRange.start && iso <= weekRange.end;
      }

      if (dateFilterMode === "custom") {
        if (customDates.length === 0 || !dateVal) return false;
        return customDates.includes(getISTDateISO(dateVal));
      }

      // "month" (default)
      const ym = dateVal ? getISTYearMonth(dateVal) : null;
      if (!ym) return true; // no usable date — don't hide it, just can't bucket it
      return ym.year === selectedMonth.year && ym.month === selectedMonth.month;
    });
  }, [visitors, search, selectedMonth, dateFilterMode, customDates]);

  // Adds the status chip filter on top of the date/search scoping above —
  // this is what the table and CSV export actually show.
  const filteredVisitors = useMemo(() => {
    if (!statusFilter) return dateScopedVisitors;
    return dateScopedVisitors.filter((v) => v.status === statusFilter);
  }, [dateScopedVisitors, statusFilter]);

  // Human-readable label for the empty-state text, CSV filename, and footer.
  const dateFilterLabel = () => {
    if (dateFilterMode === "today") return "Today";
    if (dateFilterMode === "week") return "This Week";
    if (dateFilterMode === "custom") {
      return customDates.length
        ? `${customDates.length} selected date${customDates.length === 1 ? "" : "s"}`
        : "no dates selected";
    }
    return `${MONTH_NAMES[selectedMonth.month - 1]} ${selectedMonth.year}`;
  };

  const handleLogout = () => {
    logoutAdmin();
    onLogout?.();
    navigate("/", { replace: true });
  };

  const handleExportCsv = () => {
    const headers = ["Name", "Phone", "Company", "Host", "Plant", "Purpose", "Visit Date", "Status", "Requested At", "Created by", "Checked In", "Checked Out"];
    const rows = filteredVisitors.map((v) => [
      v.name, v.phone, v.company, v.host, v.plant?.plantName, v.purpose,
      fmtDate(getVisitDate(v)),
      STATUS_LABELS[v.status] || v.status,
      fmtTime(getRequestedTime(v)), getRegisteredBy(v), fmtTime(getCheckInTime(v)), fmtTime(getCheckOutTime(v)),
    ]);
    const csv = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug =
      dateFilterMode === "today" ? "today" :
      dateFilterMode === "week" ? "this-week" :
      dateFilterMode === "custom" ? "custom-dates" :
      `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, "0")}`;
    a.download = `visitors_${slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="text-purple-400"><ShieldIcon /></div>
            <span className="text-lg font-semibold text-white">
              EHS<span className="text-purple-400">360</span>
            </span>
            <span className="hidden sm:inline text-slate-600 mx-2">/</span>
            {selectedPlantInfo ? (
              <span className="hidden sm:inline text-slate-400 text-sm">
                {selectedPlantOrgName && <span className="text-slate-300">{selectedPlantOrgName}</span>}
                {selectedPlantOrgName && <span className="text-slate-600 mx-1.5">·</span>}
                <span className="text-purple-300 font-medium">{selectedPlantInfo.plantCode}</span>
                <span className="text-slate-600 mx-1.5">·</span>
                {selectedPlantInfo.plantName}
              </span>
            ) : (
              <span className="hidden sm:inline text-slate-400 text-sm">Admin Dashboard</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {admin?.username && (
              <span className="hidden sm:block text-sm text-slate-400">
                Signed in as <span className="text-white font-medium">{admin.username}</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg px-3.5 py-2 transition"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Date filter — Today / This Week / This Month / Custom Dates (multi-select) — mirrors ManagerDashboard.jsx */}
        {activePanel === null && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1 bg-slate-800 rounded-lg p-1 flex-wrap">
                {[
                  { key: "today",  label: "Today" },
                  { key: "week",   label: "This Week" },
                  { key: "month",  label: "This Month" },
                  { key: "custom", label: "Custom Dates" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setDateFilterMode(f.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      dateFilterMode === f.key ? "bg-purple-500 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {dateFilterMode === "month" && (
                <div className="flex items-center gap-2 sm:ml-auto">
                  <button
                    onClick={() => shiftMonth(-1)}
                    className="flex items-center justify-center w-9 h-9 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
                    aria-label="Previous month"
                  >
                    <ChevronLeftIcon />
                  </button>
                  <span className="text-white font-semibold text-sm min-w-[140px] text-center">
                    {MONTH_NAMES[selectedMonth.month - 1]} {selectedMonth.year}
                  </span>
                  <button
                    onClick={() => shiftMonth(1)}
                    className="flex items-center justify-center w-9 h-9 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
                    aria-label="Next month"
                  >
                    <ChevronRightIcon />
                  </button>
                  <button
                    onClick={goToCurrentMonth}
                    className="text-xs text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg px-3 py-1.5 transition"
                  >
                    Current
                  </button>
                </div>
              )}
            </div>

            {/* Custom multi-date picker — add as many individual dates as you like */}
            {dateFilterMode === "custom" && (
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                <input
                  type="date"
                  value={customDateInput}
                  onChange={(e) => setCustomDateInput(e.target.value)}
                  className="mt-3 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition [color-scheme:dark]"
                />
                <button
                  onClick={addCustomDate}
                  className="mt-3 flex items-center gap-1 bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold rounded-lg px-3 py-2 transition"
                >
                  <PlusIcon />
                  Add Date
                </button>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {customDates.length === 0 ? (
                    <span className="text-xs text-slate-500">No dates selected yet — add one or more above.</span>
                  ) : (
                    <>
                      {customDates.map((d) => (
                        <span
                          key={d}
                          className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-full pl-3 pr-1.5 py-1"
                        >
                          {fmtDateChip(d)}
                          <button
                            onClick={() => removeCustomDate(d)}
                            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition"
                            aria-label={`Remove ${d}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <button
                        onClick={() => setCustomDates([])}
                        className="text-xs text-slate-500 hover:text-white transition px-2"
                      >
                        Clear all
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Four standalone action buttons */}
        <div className="flex flex-wrap gap-3">
          {ACTION_ITEMS.map(({ key, label, Icon, gradient }) => (
            <button
              key={key}
              onClick={() => selectActionPanel(key)}
              className={`flex items-center gap-2 bg-gradient-to-r ${gradient} text-white text-sm font-semibold rounded-full pl-5 pr-4 py-2.5 shadow-lg shadow-black/20 transition transform hover:scale-[1.03] hover:brightness-110 ${
                activePanel === key ? "ring-2 ring-white/80 ring-offset-2 ring-offset-slate-950" : ""
              }`}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {activePanel !== null ? (
          <div className="space-y-4">
            <button
              onClick={() => setActivePanel(null)}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition"
            >
              <ChevronLeftIcon />
              Back to visitor list
            </button>

            {activePanel === "visitor" && (
              <ApproveVisitorForm
                plants={plants}
                plantsLoading={plants.length === 0 && !plantsError}
                plantsError={plantsError}
                onApproved={() => loadVisitors(plantFilter)}
              />
            )}

            {activePanel === "staff" && (
              <CreateStaffPanel
                plants={plants}
                plantsLoading={plants.length === 0 && !plantsError}
                plantsError={plantsError}
              />
            )}

            {activePanel === "video" && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-white font-semibold text-sm">Induction Video</h3>
                <VideoTab plants={plants} />
              </div>
            )}

            {activePanel === "question" && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-white font-semibold text-sm">Quiz Questions</h3>
                <QuestionsTab plants={plants} />
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Stat cards — now computed from monthScopedVisitors, so they
                accurately reflect the currently selected month. */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STAT_CARD_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(statusFilter === status ? "" : status)}
                  className={`text-left bg-slate-900 border rounded-xl p-4 transition ${
                    statusFilter === status ? "border-purple-500 ring-1 ring-purple-500" : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <p className="text-2xl font-bold text-white">{countForStatus(dateScopedVisitors, status)}</p>
                  <p className="text-xs text-slate-400 mt-1">{STATUS_LABELS[status]}</p>
                </button>
              ))}
            </div>

            {/* Filter bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  placeholder="Search name, phone, company, or host…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>

              <select
                value={plantFilter}
                onChange={(e) => setPlantFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                <option value="">All plants</option>
                {plants.map((p) => (
                  <option key={p._id} value={p._id}>{p.plantName}</option>
                ))}
              </select>
              {plantsError && <p className="text-xs text-red-400">{plantsError}</p>}

              <div className="flex gap-1 bg-slate-800 rounded-lg p-1 flex-wrap">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value || "all"}
                    onClick={() => setStatusFilter(f.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      statusFilter === f.value ? "bg-purple-500 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleExportCsv}
                disabled={filteredVisitors.length === 0}
                className="flex items-center justify-center gap-1.5 bg-purple-500 hover:bg-purple-400 disabled:bg-purple-900 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition"
              >
                <DownloadIcon />
                Export CSV
              </button>
            </div>

            {/* Visitor table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              {loading ? (
                <p className="text-slate-500 text-sm text-center py-12">Loading visitors…</p>
              ) : filteredVisitors.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-12">
                  No visitors match this filter for {dateFilterLabel()}.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wide">
                        <th className="text-left font-medium px-5 py-3">Visitor</th>
                        <th className="text-left font-medium px-5 py-3">Company / Host</th>
                        <th className="text-left font-medium px-5 py-3">Plant</th>
                        <th className="text-left font-medium px-5 py-3">Visit Date</th>
                        <th className="text-left font-medium px-5 py-3">Purpose</th>
                        <th className="text-left font-medium px-5 py-3">Requested</th>
                        <th className="text-left font-medium px-5 py-3">Created by</th>
                        <th className="text-left font-medium px-5 py-3">Status</th>
                        <th className="text-left font-medium px-5 py-3">Checked In</th>
                        <th className="text-left font-medium px-5 py-3">Checked Out</th>
                        <th className="text-left font-medium px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {filteredVisitors.map((v) => {
                        const busy = actioningId === v._id;
                        return (
                          <tr key={v._id} className="hover:bg-slate-800/40 transition">
                            <td className="px-5 py-3.5">
                              <p className="text-white font-medium">{v.name}</p>
                              <p className="text-slate-500 text-xs mt-0.5">{v.phone}</p>
                            </td>
                            <td className="px-5 py-3.5 text-slate-300">
                              <p>{v.company || "—"}</p>
                              <p className="text-slate-500 text-xs mt-0.5">Host: {v.host}</p>
                            </td>
                            <td className="px-5 py-3.5 text-slate-300">{v.plant?.plantName || "—"}</td>
                            <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{fmtDate(getVisitDate(v))}</td>
                            <td className="px-5 py-3.5 text-slate-300">{v.purpose || "—"}</td>
                            <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">{fmtTime(getRequestedTime(v))}</td>
                            <td className="px-5 py-3.5 text-slate-300 text-xs whitespace-nowrap">{getRegisteredBy(v)}</td>
                            <td className="px-5 py-3.5">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[v.status] || "bg-slate-800 text-slate-400 border-slate-700"}`}>
                                {STATUS_LABELS[v.status] || v.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">{fmtTime(getCheckInTime(v))}</td>
                            <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">{fmtTime(getCheckOutTime(v))}</td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {v.status === "PASS_GENERATED" && (
                                <div className="flex gap-1.5">
                                  <button
                                    disabled={busy}
                                    onClick={() => runAction(v._id, securityCheckIn)}
                                    className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 transition"
                                  >
                                    {busy ? "…" : "Check In"}
                                  </button>
                                  <button
                                    disabled={busy}
                                    onClick={() => runAction(v._id, rejectVisitor)}
                                    className="bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 transition"
                                  >
                                    {busy ? "…" : "Reject"}
                                  </button>
                                </div>
                              )}
                              {v.status === "CHECKED_IN" && (
                                <button
                                  disabled={busy}
                                  onClick={() => runAction(v._id, securityCheckOut)}
                                  className="bg-slate-600 hover:bg-slate-500 disabled:bg-slate-800 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 transition"
                                >
                                  {busy ? "…" : "Check Out"}
                                </button>
                              )}
                              {v.status === "CHECKED_OUT" && (
                                <button
                                  disabled={busy}
                                  onClick={() => runAction(v._id, closeVisitor)}
                                  className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 transition"
                                >
                                  {busy ? "…" : "Close Visit"}
                                </button>
                              )}
                              {["CLOSED", "REJECTED", "EXPIRED", "CANCELLED"].includes(v.status) && (
                                <span className="text-slate-600 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600">
          Showing {filteredVisitors.length} of {visitors.length} visitor{visitors.length === 1 ? "" : "s"}
          {plantFilter ? "" : " across all plants"} · {dateFilterLabel()}.
        </p>
          </>
        )}
      </main>
    </div>
  );
}