import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlants, listVisitors, registerVisitor, logoutAdmin } from "../services/api";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M4 2a1 1 0 00-1 1v15a1 1 0 001 1h4v-3a1 1 0 011-1h2a1 1 0 011 1v3h4a1 1 0 001-1V3a1 1 0 00-1-1H4zm2 3a1 1 0 011-1h1a1 1 0 010 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1zM6 9a1 1 0 011-1h1a1 1 0 010 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1zM6 13a1 1 0 011-1h1a1 1 0 110 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm10 6H4v8h12V8z" clipRule="evenodd" />
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

// Attribution icon — used next to "Invited by <manager>" so it's clear who
// created each invite. The value itself already existed server-side
// (Visitor.registeredBy is set from req.user in registerVisitor) — this is
// purely surfacing that on the Manager's own screen.
const UserIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

// Local YYYY-MM-DD for the date input's default value/min — avoids the UTC
// off-by-one day that toISOString() can introduce near midnight.
const todayLocalISO = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
};

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

// Keep in sync with STATUS_FILTERS (minus "All") if you add/remove a status card.
const STAT_CARD_STATUSES = ["PASS_GENERATED", "CHECKED_IN", "CHECKED_OUT", "REJECTED"];

const countForStatus = (visitorsList, status) =>
  visitorsList.filter((v) => v.status === status).length;

// Both formatters pin the timezone to IST explicitly — same as AdminDashboard.jsx
// — so the same record shows the same date/time regardless of viewer's own
// browser/OS timezone.
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

// ── Month navigator helpers — mirrors AdminDashboard.jsx exactly ───────────
const getISTYearMonth = (dateVal) => {
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (Number.isNaN(d.getTime())) return null;
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

// ── Today / This Week / Custom Dates helpers ────────────────────────────────
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

// ── Field lookup — mirrors AdminDashboard.jsx exactly ───────────────────────
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
// both so the UI doesn't break either way.
const getRegisteredBy = (v) => {
  const rb = v.registeredBy;
  if (!rb) return "—";
  if (typeof rb === "string") return rb;
  return rb.username || rb.name || rb._id || "—";
};

const csvCell = (val) => {
  const s = String(val ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// The Plant schema has no dedicated "organization" field — the company name
// is embedded at the start of `location` (e.g. "Kerakoll India Pvt. Ltd.
// Plot No 02-01, 01A & 62, ..."). Heuristic: cut right before "Plot" or the
// first digit (start of the plot/door number), whichever comes first.
// Fragile if a location string is formatted differently — falls back to ""
// rather than showing garbled text.
const extractOrgFromLocation = (location) => {
  if (!location) return "";
  const match = location.match(/^(.*?)(?:\s*,?\s*Plot\b|\s+\d)/i);
  const org = match ? match[1] : "";
  return org.replace(/[,\s]+$/, "").trim();
};

const ErrorBox = ({ children }) => (
  <div className="bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">{children}</div>
);
const SuccessBox = ({ children }) => (
  <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm rounded-lg px-4 py-3">{children}</div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Invite Visitor form — UNCHANGED from the user's latest ManagerDashboard.jsx,
// attribution feature included as-is. Only addition: an onInvited callback so
// the dashboard's visitor list/stat cards refresh after a successful invite.
//
// This creates the visitor record at status INVITED — it does NOT put them
// in Security's gate queue yet. The visitor still has to log in, complete
// induction (video + quiz), and have their pass generated before Security
// sees them — and only on the visit date selected below. See
// visitorController.js TRANSITIONS for the full pipeline.
//
// managerUsername: purely for display (the "Invited by ..." line in the
// success message) — the actual createdBy/registeredBy attribution is
// already handled server-side from the JWT in registerVisitor, so nothing
// extra is sent in the payload for this.
// ─────────────────────────────────────────────────────────────────────────────
function InviteVisitorForm({ plants, plantsLoading, plantsError, managerPlant, managerUsername, onInvited }) {
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [company, setCompany]     = useState("");
  const [purpose, setPurpose]     = useState("");
  const [host, setHost]           = useState("");
  const [plant, setPlant]         = useState(managerPlant || ""); // preloaded from manager profile
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
        name: name.trim(),
        phone: phone.trim(),
        company: company.trim(),
        purpose,
        host: host.trim(),
        plant,
        visitDate,
      });

      setSuccess(`${data.message}${managerUsername ? ` — created by ${managerUsername}.` : ""}`);

      // reset form — keep the manager's plant prefilled instead of clearing it
      setName(""); setPhone(""); setCompany(""); setPurpose(""); setHost("");
      setPlant(managerPlant || "");
      setVisitDate(todayLocalISO());
      onInvited?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900 border border-slate-800 rounded-xl p-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Arun Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Phone <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <BuildingIcon />
            Plant <span className="text-red-400">*</span>
          </label>
          <select
            value={plant}
            onChange={(e) => setPlant(e.target.value)}
            disabled={plantsLoading || !!plantsError}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="">
              {plantsLoading ? "Loading plants…" : plantsError ? "Could not load plants" : "Select plant…"}
            </option>
            {plants.map((p) => (
              <option key={p._id} value={p.plantCode}>
                {p.plantName} — {p.location}
              </option>
            ))}
          </select>
          {plantsError && <p className="text-xs text-red-400 mt-1.5">{plantsError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <CalendarIcon />
            Visit Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={visitDate}
            min={todayLocalISO()}
            onChange={(e) => setVisitDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition [color-scheme:dark]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Company / Organisation</label>
        <input
          type="text"
          placeholder="e.g. ABC Contractors Ltd"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Host Employee Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="Who are they visiting?"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Purpose of Visit <span className="text-red-400">*</span>
        </label>
        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
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

      {error && (
        <div className="flex items-start gap-2.5 bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm rounded-lg px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5 shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-6 py-2.5 text-sm transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            Sending Invite…
          </>
        ) : "Invite Visitor"}
      </button>
    </form>
  );
}

// ── Main Manager Dashboard ──────────────────────────────────────────────────
export default function ManagerDashboard({ onLogout }) {
  const navigate = useNavigate();

  const [manager] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ehs_user") || "null");
    } catch {
      return null;
    }
  });

  // registerVisitor (via InviteVisitorForm) expects the plant CODE, e.g. "PLT-CHN01".
  const managerPlantCode =
    typeof manager?.plant === "string"
      ? manager.plant
      : manager?.plant?.plantCode || manager?.plantCode || "";

  const [plants, setPlants]               = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(true);
  const [plantsError, setPlantsError]     = useState("");

  // /api/visitors filters by the plant's Mongo _id (same as Admin's plant
  // dropdown, which uses p._id) — NOT the plantCode. If the backend already
  // gives us a populated plant object on the manager's user record, use its
  // _id directly; otherwise look it up from the loaded plants list.
 const managerPlantId = useMemo(() => {
  if (manager?.plant && typeof manager.plant === "object" && manager.plant._id) {
    return manager.plant._id;
  }
  if (!managerPlantCode) return "";
  return plants.find((p) => p.plantCode === managerPlantCode)?._id || "";
}, [manager, managerPlantCode, plants]);

// Full plant record (organization, plantCode, plantName) for the header
// ribbon — prefer an already-populated manager.plant object, fall back to
// matching it out of the loaded plants list.
const managerPlantInfo = useMemo(() => {
  if (manager?.plant && typeof manager.plant === "object" && manager.plant.plantCode) {
    return manager.plant;
  }
  if (!managerPlantCode) return null;
  return plants.find((p) => p.plantCode === managerPlantCode) || null;
}, [manager, managerPlantCode, plants]);

const managerOrgName = extractOrgFromLocation(managerPlantInfo?.location);

  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
  // picked dates. Multiple dates can be added and stacked — a visitor
  // matching ANY of them is shown.
  const [dateFilterMode, setDateFilterMode] = useState("month"); // "today" | "week" | "month" | "custom"
  const [customDates, setCustomDates] = useState([]); // ["YYYY-MM-DD", ...]
  const [customDateInput, setCustomDateInput] = useState(todayLocalISO());

  const addCustomDate = () => {
    if (!customDateInput) return;
    setCustomDates((prev) => (prev.includes(customDateInput) ? prev : [...prev, customDateInput].sort()));
  };
  const removeCustomDate = (d) => setCustomDates((prev) => prev.filter((x) => x !== d));

  // Invite Visitor sits behind its own action button, same pattern as Admin.
  const [showInviteForm, setShowInviteForm] = useState(false);

  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Guard the route — no token means no business being here.
  useEffect(() => {
    if (!localStorage.getItem("ehs_token")) {
      navigate("/site", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    getPlants()
      .then(setPlants)
      .catch((err) => setPlantsError(err.message))
      .finally(() => setPlantsLoading(false));
  }, []);

  const loadVisitors = async () => {
    setLoading(true);
    setError("");
    try {
      // Scoped to the manager's own plant only, full history (includeAll=true)
      // — same pattern AdminDashboard.jsx uses for its plant-filtered view.
      // Must pass the plant's ObjectId here, not its code — the backend
      // casts this param straight to ObjectId (see Visitor model "plant" path).
      const data = await listVisitors(managerPlantId || undefined, undefined, false, true);
      setVisitors(data.visitors);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logoutAdmin();
        navigate("/site", { replace: true });
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for the plants list to finish loading so managerPlantId has a
    // chance to resolve — firing early would either send no filter (showing
    // every plant's visitors) or, worse, a stale/unresolved value.
    if (plantsLoading) return;
    loadVisitors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantsLoading, managerPlantId]);

  // Scoped by search + the active date filter (NOT status) — feeds the stat
  // cards. "month" branch matches the original month-navigator behavior;
  // today/week/custom are additional filter modes.
  const dateScopedVisitors = useMemo(() => {
    const q = search.trim().toLowerCase();
    const todayISO = getISTDateISO(new Date());
    const weekRange = dateFilterMode === "week" ? getISTWeekRange(new Date()) : null;

    return visitors.filter((v) => {
      const matchesSearch =
        !q ||
        [v.name, v.phone, v.company, v.host]
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
        // Nothing picked yet → show nothing, rather than silently falling
        // back to "everything".
        if (customDates.length === 0 || !dateVal) return false;
        return customDates.includes(getISTDateISO(dateVal));
      }

      // "month" (default)
      const ym = dateVal ? getISTYearMonth(dateVal) : null;
      if (!ym) return true;
      return ym.year === selectedMonth.year && ym.month === selectedMonth.month;
    });
  }, [visitors, search, selectedMonth, dateFilterMode, customDates]);

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
    navigate("/site", { replace: true });
  };

  const handleExportCsv = () => {
    const headers = ["Name", "Phone", "Company", "Host", "Purpose", "Visit Date", "Status", "Requested At", "Created By", "Checked In", "Checked Out"];
    const rows = filteredVisitors.map((v) => [
      v.name, v.phone, v.company, v.host, v.purpose,
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
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="text-teal-400"><ShieldIcon /></div>
            <span className="text-lg font-semibold text-white">
              EHS<span className="text-teal-400">360</span>
            </span>
            <span className="hidden sm:inline text-slate-600 mx-2">/</span>
{managerPlantInfo ? (
  <span className="hidden sm:inline text-slate-400 text-sm">
    {managerOrgName && <span className="text-slate-300">{managerOrgName}</span>}
    {managerOrgName && <span className="text-slate-600 mx-1.5">·</span>}
    <span className="text-teal-300 font-medium">{managerPlantInfo.plantCode}</span>
    <span className="text-slate-600 mx-1.5">·</span>
    {managerPlantInfo.plantName}
  </span>
) : (
  <span className="hidden sm:inline text-slate-400 text-sm">Manager</span>
)}
          </div>
          <div className="flex items-center gap-4">
            {manager?.username && (
              <span className="hidden sm:block text-sm text-slate-400">
                Signed in as <span className="text-white font-medium">{manager.username}</span>
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
        {/* Date filter — Today / This Week / This Month / Custom Dates (multi-select) */}
        {!showInviteForm && (
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
                      dateFilterMode === f.key ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-white"
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
                    className="text-xs text-teal-300 hover:text-teal-200 bg-teal-500/10 hover:bg-teal-500/20 rounded-lg px-3 py-1.5 transition"
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
                  className="mt-3 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition [color-scheme:dark]"
                />
                <button
                  onClick={addCustomDate}
                  className="mt-3 flex items-center gap-1 bg-teal-500 hover:bg-teal-400 text-white text-xs font-semibold rounded-lg px-3 py-2 transition"
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

        {/* Invite Visitor action button */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowInviteForm((prev) => !prev)}
            className={`flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm font-semibold rounded-full pl-5 pr-4 py-2.5 shadow-lg shadow-black/20 transition transform hover:scale-[1.03] hover:brightness-110 ${
              showInviteForm ? "ring-2 ring-white/80 ring-offset-2 ring-offset-slate-950" : ""
            }`}
          >
            <PlusIcon />
            Invite Visitor
          </button>
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        {showInviteForm ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowInviteForm(false)}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition"
            >
              <ChevronLeftIcon />
              Back to visitor list
            </button>

            <div className="mb-2">
              <h2 className="text-2xl font-bold text-white">Invite a Visitor</h2>
              <p className="text-slate-400 text-sm mt-1">
                They'll need to check in, complete safety induction, and pass the assessment before
                a pass is generated — only then will Security see them at the gate, on the visit date you select.
              </p>
              {manager?.username && (
                <p className="text-xs text-teal-400/80 mt-2 flex items-center gap-1.5">
                  <UserIcon />
                  Created by <span className="font-semibold text-teal-300">{manager.username}</span>
                </p>
              )}
            </div>

            <InviteVisitorForm
              plants={plants}
              plantsLoading={plantsLoading}
              plantsError={plantsError}
              managerPlant={managerPlantCode}
              managerUsername={manager?.username}
              onInvited={loadVisitors}
            />
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-bold text-white">Manager Dashboard</h2>
              <p className="text-slate-400 text-sm mt-1">
                Visitors you've invited for your plant, and where each one stands in the check-in pipeline.
              </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STAT_CARD_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(statusFilter === status ? "" : status)}
                  className={`text-left bg-slate-900 border rounded-xl p-4 transition ${
                    statusFilter === status ? "border-teal-500 ring-1 ring-teal-500" : "border-slate-800 hover:border-slate-700"
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
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>

              <div className="flex gap-1 bg-slate-800 rounded-lg p-1 flex-wrap">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value || "all"}
                    onClick={() => setStatusFilter(f.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      statusFilter === f.value ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleExportCsv}
                disabled={filteredVisitors.length === 0}
                className="flex items-center justify-center gap-1.5 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-900 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition"
              >
                <DownloadIcon />
                Export CSV
              </button>
            </div>

            {/* Visitor table — status only, no gate actions (that's Security's job) */}
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
                        <th className="text-left font-medium px-5 py-3">Visit Date</th>
                        <th className="text-left font-medium px-5 py-3">Purpose</th>
                        <th className="text-left font-medium px-5 py-3">Requested</th>
                        <th className="text-left font-medium px-5 py-3">Created by</th>
                        <th className="text-left font-medium px-5 py-3">Status</th>
                        <th className="text-left font-medium px-5 py-3">Checked In</th>
                        <th className="text-left font-medium px-5 py-3">Checked Out</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {filteredVisitors.map((v) => (
                        <tr key={v._id} className="hover:bg-slate-800/40 transition">
                          <td className="px-5 py-3.5">
                            <p className="text-white font-medium">{v.name}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{v.phone}</p>
                          </td>
                          <td className="px-5 py-3.5 text-slate-300">
                            <p>{v.company || "—"}</p>
                            <p className="text-slate-500 text-xs mt-0.5">Host: {v.host}</p>
                          </td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600">
              Showing {filteredVisitors.length} of {visitors.length} visitor{visitors.length === 1 ? "" : "s"}
              {" "}· {dateFilterLabel()}.
            </p>
          </>
        )}
      </main>
    </div>
  );
}