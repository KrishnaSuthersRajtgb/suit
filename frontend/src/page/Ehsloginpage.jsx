import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPlants,
  checkinVisitor,
  registerVisitor,
  loginAdmin,
  listVisitors,
  securityCheckIn,
  securityCheckOut,
  rejectVisitor,
} from "../services/api";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M10 1a4 4 0 00-4 4v2H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-1V5a4 4 0 00-4-4zm2 6V5a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
  </svg>
);

const UserGearIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zM4 17a6 6 0 0112 0H4z" clipRule="evenodd" />
    <path d="M16.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M6 6V4a2 2 0 012-2h4a2 2 0 012 2v2h3a1 1 0 011 1v9a2 2 0 01-2 2H2a2 2 0 01-2-2V7a1 1 0 011-1h3zm2-2v2h4V4H8z" />
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M4 2a1 1 0 00-1 1v15a1 1 0 001 1h4v-3a1 1 0 011-1h2a1 1 0 011 1v3h4a1 1 0 001-1V3a1 1 0 00-1-1H4zm2 3a1 1 0 011-1h1a1 1 0 010 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1zM6 9a1 1 0 011-1h1a1 1 0 010 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1zM6 13a1 1 0 011-1h1a1 1 0 110 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1z" clipRule="evenodd" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// ── Shared Plant <select> ────────────────────────────────────────────────────
// `plants` is fetched once by the parent (GET /api/plants) and passed down,
// so every form/panel shares the same list instead of each firing its own request.
// ─────────────────────────────────────────────────────────────────────────────
function PlantSelect({ value, onChange, focusRingClass, plants, plantsLoading, plantsError, label = "Plant", required = true }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
        <BuildingIcon />
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={plantsLoading || !!plantsError}
        className={`w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed`}
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
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Visitor Form ────────────────────────────────────────────────────────────────
// POST /api/visitors/checkin with just the phone number — this is the
// visitor's own app login, separate from Security's physical gate actions.
// - 200  → server returns the visitor record; log in.
// - 404  → no approved record found for that number.
// - 403  → the visit request was rejected.
// ─────────────────────────────────────────────────────────────────────────────
function VisitorForm({ onVisitorCheckin }) {
  const navigate = useNavigate();
  const [phone, setPhone]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    setLoading(true);
    try {
      const { visitor } = await checkinVisitor(phone.trim());
      onVisitorCheckin?.(visitor);
      navigate("/visitor");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Phone Number <span className="text-red-400">*</span>
        </label>
        <input
          type="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <p className="text-xs text-slate-500 mt-2">
          Enter the phone number your visit was approved under.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 text-sm transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            Checking…
          </>
        ) : "Check In"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Manager Form ─────────────────────────────────────────────────────────────
// Was previously a username/password login — now the Manager approves an
// incoming visitor directly (POST /api/visitors/register). Security then
// sees the approved record in their tab and checks the visitor in at the gate.
// ─────────────────────────────────────────────────────────────────────────────
function ManagerForm({ plants, plantsLoading, plantsError }) {
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [company, setCompany] = useState("");
  const [purpose, setPurpose] = useState("");
  const [host, setHost]       = useState("");
  const [plant, setPlant]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim())    { setError("Full name is required."); return; }
    if (!phone.trim())   { setError("Phone number is required."); return; }
    if (!plant)          { setError("Plant is required."); return; }
    if (!purpose.trim()) { setError("Purpose of visit is required."); return; }
    if (!host.trim())    { setError("Host employee name is required."); return; }

    setLoading(true);
    try {
      const data = await registerVisitor({
        name: name.trim(),
        phone: phone.trim(),
        company: company.trim(),
        purpose,
        host: host.trim(),
        plant,
      });

      setSuccess(data.message);

      // reset form
      setName(""); setPhone(""); setCompany(""); setPurpose(""); setHost(""); setPlant("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

      <PlantSelect
        value={plant}
        onChange={setPlant}
        focusRingClass="focus:ring-teal-500"
        plants={plants}
        plantsLoading={plantsLoading}
        plantsError={plantsError}
      />

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
        className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 text-sm transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            Approving…
          </>
        ) : "Approve Visitor"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Security Panel ───────────────────────────────────────────────────────────
// No login — lists manager-approved visitors (optionally filtered by Plant)
// and lets Security Check In / Check Out / Reject each one.
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  APPROVED:    "bg-amber-500/20 text-amber-300 border-amber-700/50",
  CHECKED_IN:  "bg-emerald-500/20 text-emerald-300 border-emerald-700/50",
  CHECKED_OUT: "bg-slate-700/50 text-slate-400 border-slate-600/50",
  REJECTED:    "bg-red-500/20 text-red-300 border-red-700/50",
};

const STATUS_LABELS = {
  APPROVED: "Awaiting Arrival",
  CHECKED_IN: "Checked In",
  CHECKED_OUT: "Checked Out",
  REJECTED: "Rejected",
};

// Order + short labels for the filter tabs above the list.
const STATUS_FILTERS = [
  { value: "",            label: "All" },
  { value: "APPROVED",    label: "Awaiting" },
  { value: "CHECKED_IN",  label: "Checked In" },
  { value: "CHECKED_OUT", label: "Checked Out" },
  { value: "REJECTED",    label: "Rejected" },
];

const countFor = (counts, value) => {
  if (!counts) return 0;
  if (!value) return counts.APPROVED + counts.CHECKED_IN + counts.CHECKED_OUT + counts.REJECTED;
  return counts[value] ?? 0;
};

function SecurityPanel({ plants, plantsLoading, plantsError }) {
  const [plantFilter, setPlantFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [visitors, setVisitors]         = useState([]);
  const [counts, setCounts]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [actioningId, setActioningId]   = useState(null); // visitor._id currently being updated

  const loadVisitors = async (plantCode, status) => {
    setLoading(true);
    setError("");
    try {
      const data = await listVisitors(plantCode || undefined, status || undefined);
      setVisitors(data.visitors);
      setCounts(data.counts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors(plantFilter, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantFilter, statusFilter]);

  const runAction = async (id, action) => {
    setActioningId(id);
    setError("");
    try {
      await action(id);
      // The action may move a visitor out of the currently-filtered status
      // (e.g. Check In while filtered to "Awaiting") — simplest correct
      // behaviour is to just reload the list + counts.
      await loadVisitors(plantFilter, statusFilter);
    } catch (err) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 -mt-1">Showing today's approvals only — a new day needs a new approval.</p>

      <PlantSelect
        value={plantFilter}
        onChange={setPlantFilter}
        focusRingClass="focus:ring-amber-500"
        plants={plants}
        plantsLoading={plantsLoading}
        plantsError={plantsError}
        label="Filter by Plant"
        required={false}
      />

      {/* Status filter tabs with live counts */}
      <div className="grid grid-cols-5 gap-1 bg-slate-800 rounded-xl p-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            onClick={() => setStatusFilter(f.value)}
            className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg text-[11px] font-medium transition ${
              statusFilter === f.value ? "bg-amber-500 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="text-sm font-bold">{countFor(counts, f.value)}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500 text-sm text-center py-8">Loading visitors…</p>
      ) : visitors.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">No visitors match this filter today.</p>
      ) : (
        <div className="space-y-3 max-h-[22rem] overflow-y-auto pr-1">
          {visitors.map((v) => {
            const busy = actioningId === v._id;
            return (
              <div key={v._id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{v.name}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{v.phone} · Host: {v.host}</p>
                    {v.plant?.plantName && (
                      <p className="text-slate-500 text-xs mt-0.5">{v.plant.plantName}</p>
                    )}
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[v.status]}`}>
                    {STATUS_LABELS[v.status]}
                  </span>
                </div>

                {v.status === "APPROVED" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      disabled={busy}
                      onClick={() => runAction(v._id, securityCheckIn)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg py-2 transition"
                    >
                      {busy ? "…" : "Check In"}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => runAction(v._id, rejectVisitor)}
                      className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg py-2 transition"
                    >
                      {busy ? "…" : "Reject"}
                    </button>
                  </div>
                )}

                {v.status === "CHECKED_IN" && (
                  <button
                    disabled={busy}
                    onClick={() => runAction(v._id, securityCheckOut)}
                    className="w-full mt-3 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-800 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg py-2 transition"
                  >
                    {busy ? "…" : "Check Out"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Admin Form ───────────────────────────────────────────────────────────────
// POST /api/auth/admin/login — stores the JWT and calls onLoginSuccess.
// ─────────────────────────────────────────────────────────────────────────────
function AdminForm({ onLoginSuccess, plants, plantsLoading, plantsError }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [plant, setPlant]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) { setError("Username is required."); return; }
    if (!password.trim()) { setError("Password is required."); return; }
    if (!plant)            { setError("Plant is required."); return; }

    setLoading(true);
    try {
      const data = await loginAdmin({ username: username.trim(), password, plant });

      localStorage.setItem("ehs_token", data.token);
      onLoginSuccess?.(data.user);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Username <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="admin.username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Password <span className="text-red-400">*</span>
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
        />
      </div>

      <PlantSelect
        value={plant}
        onChange={setPlant}
        focusRingClass="focus:ring-purple-500"
        plants={plants}
        plantsLoading={plantsLoading}
        plantsError={plantsError}
      />

      {error && (
        <div className="flex items-start gap-2.5 bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-500 hover:bg-purple-400 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 text-sm transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            Signing in…
          </>
        ) : "Sign In as Admin"}
      </button>
    </form>
  );
}

// ── Main Login Page ────────────────────────────────────────────────────────────
export default function EHSLoginPage({ onLoginSuccess, onVisitorCheckin }) {
  // Employee tab removed from UI — defaulting to "visitor".
  const [tab, setTab] = useState("visitor");

  // Plants are fetched once here and shared by Security / Manager / Admin.
  const [plants, setPlants]               = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(true);
  const [plantsError, setPlantsError]     = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getPlants();
        if (!cancelled) setPlants(data);
      } catch (err) {
        if (!cancelled) setPlantsError(err.message);
      } finally {
        if (!cancelled) setPlantsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border-r border-slate-800">
        <div className="flex items-center gap-3">
          <ShieldIcon />
          <span className="text-xl font-semibold text-white">SafeGuard <span className="text-emerald-400">EHS</span></span>
        </div>
        <div>
          <span className="text-xs font-mono tracking-widest text-emerald-500 uppercase">
            Environment · Health · Safety
          </span>
          <h1 className="text-4xl font-bold text-white leading-tight mt-4 mb-4">
            Every worker home safe.
            <br />
            <span className="text-emerald-400">Every day.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Manage incident reports, safety checklists, compliance tracking, and hazard logs — all in one place.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="text-emerald-400"><ShieldIcon /></div>
          <span className="text-lg font-semibold text-white">SafeGuard <span className="text-emerald-400">EHS</span></span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Welcome</h2>
            <p className="text-slate-400 text-sm mt-1">Check in, or register a visitor to continue.</p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-800 rounded-xl p-1 mb-6">
            <button
              onClick={() => setTab("visitor")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                tab === "visitor" ? "bg-blue-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
              </svg>
              <span className="hidden sm:inline">Visitor</span>
            </button>
            <button
              onClick={() => setTab("security")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                tab === "security" ? "bg-amber-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <LockIcon />
              <span className="hidden sm:inline">Security</span>
            </button>
            <button
              onClick={() => setTab("admin")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                tab === "admin" ? "bg-purple-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <UserGearIcon />
              <span className="hidden sm:inline">Admin</span>
            </button>
            <button
              onClick={() => setTab("manager")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                tab === "manager" ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <BriefcaseIcon />
              <span className="hidden sm:inline">Manager</span>
            </button>
          </div>

          {tab === "visitor" && (
            <>
              <p className="text-slate-400 text-sm mb-5">Enter your phone number to check in for your visit.</p>
              <VisitorForm onVisitorCheckin={onVisitorCheckin} />
            </>
          )}

          {tab === "security" && (
            <>
              <p className="text-slate-400 text-sm mb-5">Check in, check out, or reject manager-approved visitors.</p>
              <SecurityPanel plants={plants} plantsLoading={plantsLoading} plantsError={plantsError} />
            </>
          )}

          {tab === "admin" && (
            <>
              <p className="text-slate-400 text-sm mb-5">Sign in with your admin credentials.</p>
              <AdminForm
                onLoginSuccess={onLoginSuccess}
                plants={plants}
                plantsLoading={plantsLoading}
                plantsError={plantsError}
              />
            </>
          )}

          {tab === "manager" && (
            <>
              <p className="text-slate-400 text-sm mb-5">Approve an incoming visitor's details before they arrive.</p>
              <ManagerForm plants={plants} plantsLoading={plantsLoading} plantsError={plantsError} />
            </>
          )}

          <p className="text-center text-xs text-slate-600 mt-6">
            Having trouble? Contact{" "}
            <span className="text-slate-400 hover:text-emerald-400 cursor-pointer transition">IT Support</span>{" "}
            or your site administrator.
          </p>
        </div>
      </div>
    </div>
  );
}