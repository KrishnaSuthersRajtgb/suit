import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPlants,
  listVisitors,
  registerVisitor,
  securityCheckIn,
  securityCheckOut,
  rejectVisitor,
  logoutAdmin,
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

const fmtTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

// ── Resilient field lookup ───────────────────────────────────────────────────
// We don't know your exact Visitor schema field names, so this tries several
// common variants (flat and nested) instead of assuming one. Once you confirm
// the real field name, delete the ones that don't apply and keep just yours —
// e.g. if your schema uses `visitor.gate.checkInTime`, just use that directly.
const pickTime = (obj, paths) => {
  for (const path of paths) {
    const val = path.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), obj);
    if (val) return val;
  }
  return null;
};

const getCheckInTime = (v) =>
  pickTime(v, [
    "checkInTime", "checkinTime", "checkInAt", "checkinAt", "checkIn",
    "actualCheckIn", "gate.checkInTime", "log.checkInTime",
  ]);

const getCheckOutTime = (v) =>
  pickTime(v, [
    "checkOutTime", "checkoutTime", "checkOutAt", "checkoutAt", "checkOut",
    "actualCheckOut", "gate.checkOutTime", "log.checkOutTime",
  ]);

// Turns a row into a safe CSV cell (quotes anything with a comma/quote/newline).
const csvCell = (val) => {
  const s = String(val ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// ─────────────────────────────────────────────────────────────────────────────
// ── Approve Visitor (inline, collapsible) ────────────────────────────────────
// Same capability the Manager has — Admin can register a visitor directly.
// ─────────────────────────────────────────────────────────────────────────────
function ApproveVisitorForm({ plants, plantsLoading, plantsError, onApproved }) {
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
        name: name.trim(), phone: phone.trim(), company: company.trim(),
        purpose, host: host.trim(), plant,
      });
      setSuccess(data.message || "Visitor approved.");
      setName(""); setPhone(""); setCompany(""); setPurpose(""); setHost(""); setPlant("");
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
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text" placeholder="e.g. Arun Sharma" value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Phone <span className="text-red-400">*</span>
          </label>
          <input
            type="tel" placeholder="+91 98765 43210" value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Plant <span className="text-red-400">*</span>
          </label>
          <select
            value={plant} onChange={(e) => setPlant(e.target.value)}
            disabled={plantsLoading || !!plantsError}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-60"
          >
            <option value="">{plantsLoading ? "Loading…" : "Select plant…"}</option>
            {plants.map((p) => (
              <option key={p._id} value={p.plantCode}>{p.plantName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Company / Organisation</label>
          <input
            type="text" placeholder="e.g. ABC Contractors Ltd" value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Host Employee Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text" placeholder="Who are they visiting?" value={host}
            onChange={(e) => setHost(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Purpose of Visit <span className="text-red-400">*</span>
          </label>
          <select
            value={purpose} onChange={(e) => setPurpose(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
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
      </div>

      {error && <div className="bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">{error}</div>}
      {success && <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm rounded-lg px-4 py-3">{success}</div>}

      <button
        type="submit" disabled={loading}
        className="w-full sm:w-auto bg-purple-500 hover:bg-purple-400 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-6 py-2.5 text-sm transition"
      >
        {loading ? "Approving…" : "Approve Visitor"}
      </button>
    </form>
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
  const [search, setSearch]             = useState("");
  const [showApproveForm, setShowApproveForm] = useState(false);

  const [visitors, setVisitors]         = useState([]);
  const [counts, setCounts]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [actioningId, setActioningId]   = useState(null);

  // Guard the route — no token means no business being here.
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

  const loadVisitors = async (plantCode, status) => {
    setLoading(true);
    setError("");
    try {
      const data = await listVisitors(plantCode || undefined, status || undefined);
      setVisitors(data.visitors);
      setCounts(data.counts);
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
    loadVisitors(plantFilter, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantFilter, statusFilter]);

  const runAction = async (id, action) => {
    setActioningId(id);
    setError("");
    try {
      await action(id);
      await loadVisitors(plantFilter, statusFilter);
    } catch (err) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const filteredVisitors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visitors;
    return visitors.filter((v) =>
      [v.name, v.phone, v.company, v.host, v.plant?.plantName]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [visitors, search]);

  const handleLogout = () => {
    logoutAdmin();
    onLogout?.();
    navigate("/", { replace: true });
  };

  const handleExportCsv = () => {
    const headers = ["Name", "Phone", "Company", "Host", "Plant", "Purpose", "Status", "Requested At", "Checked In", "Checked Out"];
    const rows = filteredVisitors.map((v) => [
      v.name, v.phone, v.company, v.host, v.plant?.plantName, v.purpose,
      STATUS_LABELS[v.status] || v.status,
      fmtTime(v.createdAt), fmtTime(getCheckInTime(v)), fmtTime(getCheckOutTime(v)),
    ]);
    const csv = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitors_${new Date().toISOString().slice(0, 10)}.csv`;
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
              SafeGuard <span className="text-purple-400">EHS</span>
            </span>
            <span className="hidden sm:inline text-slate-600 mx-2">/</span>
            <span className="hidden sm:inline text-slate-400 text-sm">Admin Dashboard</span>
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
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATUS_FILTERS.filter((f) => f.value).map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(statusFilter === f.value ? "" : f.value)}
              className={`text-left bg-slate-900 border rounded-xl p-4 transition ${
                statusFilter === f.value ? "border-purple-500 ring-1 ring-purple-500" : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <p className="text-2xl font-bold text-white">{countFor(counts, f.value)}</p>
              <p className="text-xs text-slate-400 mt-1">{f.label}</p>
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
              <option key={p._id} value={p.plantCode}>{p.plantName}</option>
            ))}
          </select>
          {plantsError && <p className="text-xs text-red-400">{plantsError}</p>}

          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
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
            onClick={() => setShowApproveForm((s) => !s)}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition"
          >
            <PlusIcon />
            {showApproveForm ? "Close" : "Approve Visitor"}
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredVisitors.length === 0}
            className="flex items-center justify-center gap-1.5 bg-purple-500 hover:bg-purple-400 disabled:bg-purple-900 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition"
          >
            <DownloadIcon />
            Export CSV
          </button>
        </div>

        {/* Approve Visitor — same capability Manager has, available right here */}
        {showApproveForm && (
          <ApproveVisitorForm
            plants={plants}
            plantsLoading={plants.length === 0 && !plantsError}
            plantsError={plantsError}
            onApproved={() => loadVisitors(plantFilter, statusFilter)}
          />
        )}

        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Visitor table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <p className="text-slate-500 text-sm text-center py-12">Loading visitors…</p>
          ) : filteredVisitors.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-12">No visitors match this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wide">
                    <th className="text-left font-medium px-5 py-3">Visitor</th>
                    <th className="text-left font-medium px-5 py-3">Company / Host</th>
                    <th className="text-left font-medium px-5 py-3">Plant</th>
                    <th className="text-left font-medium px-5 py-3">Purpose</th>
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
                        <td className="px-5 py-3.5 text-slate-300">{v.purpose || "—"}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[v.status]}`}>
                            {STATUS_LABELS[v.status] || v.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">{fmtTime(getCheckInTime(v))}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">{fmtTime(getCheckOutTime(v))}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {v.status === "APPROVED" && (
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
                          {(v.status === "CHECKED_OUT" || v.status === "REJECTED") && (
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
          {plantFilter ? "" : " across all plants"}.
        </p>
      </main>
    </div>
  );
}