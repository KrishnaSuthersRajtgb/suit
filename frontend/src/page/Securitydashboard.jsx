import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPlants,
  listVisitors,
  securityCheckIn,
  securityCheckOut,
  closeVisitor,
  rejectVisitor,
  logoutAdmin,
} from "../services/api";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M6 10a.75.75 0 01.75-.75h9.19l-2.22-2.22a.75.75 0 111.06-1.06l3.5 3.5a.75.75 0 010 1.06l-3.5 3.5a.75.75 0 11-1.06-1.06l2.22-2.22H6.75A.75.75 0 016 10z" clipRule="evenodd" />
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M4 2a1 1 0 00-1 1v15a1 1 0 001 1h4v-3a1 1 0 011-1h2a1 1 0 011 1v3h4a1 1 0 001-1V3a1 1 0 00-1-1H4zm2 3a1 1 0 011-1h1a1 1 0 010 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1zM6 9a1 1 0 011-1h1a1 1 0 010 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1zM6 13a1 1 0 011-1h1a1 1 0 110 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1z" clipRule="evenodd" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);

// Attribution icon — mirrors AdminDashboard.jsx / ManagerDashboard.jsx.
const UserIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

// ── Gate-relevant statuses: what Security acts on ───────────────────────────
const STATUS_STYLES = {
  PASS_GENERATED: "bg-amber-500/20 text-amber-300 border-amber-700/50",
  CHECKED_IN:     "bg-emerald-500/20 text-emerald-300 border-emerald-700/50",
  CHECKED_OUT:    "bg-sky-500/20 text-sky-300 border-sky-700/50",
  CLOSED:         "bg-slate-700/50 text-slate-400 border-slate-600/50",
  REJECTED:       "bg-red-500/20 text-red-300 border-red-700/50",
  EXPIRED:        "bg-orange-500/20 text-orange-300 border-orange-700/50",
  CANCELLED:      "bg-slate-700/50 text-slate-500 border-slate-600/50",
  // Pre-gate (pipeline view only, read-only)
  DRAFT:              "bg-slate-700/40 text-slate-500 border-slate-600/40",
  INVITED:            "bg-blue-500/20 text-blue-300 border-blue-700/50",
  INDUCTION_STARTED:  "bg-indigo-500/20 text-indigo-300 border-indigo-700/50",
  VIDEO_COMPLETED:    "bg-purple-500/20 text-purple-300 border-purple-700/50",
  FAILED_ASSESSMENT:  "bg-red-500/15 text-red-300/80 border-red-800/40",
  ASSESSMENT_PASSED:  "bg-teal-500/20 text-teal-300 border-teal-700/50",
};

const STATUS_LABELS = {
  DRAFT: "Draft",
  INVITED: "Invited",
  INDUCTION_STARTED: "Induction Started",
  VIDEO_COMPLETED: "Video Completed",
  FAILED_ASSESSMENT: "Failed Assessment",
  ASSESSMENT_PASSED: "Assessment Passed",
  PASS_GENERATED: "Ready at Gate",
  CHECKED_IN: "Checked In",
  CHECKED_OUT: "Checked Out",
  CLOSED: "Closed",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

// Filter chips shown in the default (gate-only) view.
const GATE_STATUS_FILTERS = [
  { value: "",               label: "All" },
  { value: "PASS_GENERATED", label: "Ready" },
  { value: "CHECKED_IN",     label: "Checked In" },
  { value: "CHECKED_OUT",    label: "Checked Out" },
  { value: "CLOSED",         label: "Closed" },
  { value: "REJECTED",       label: "Rejected" },
];

const countFor = (counts, value, statuses) => {
  if (!counts) return 0;
  if (!value) return statuses.reduce((sum, s) => sum + (counts[s] || 0), 0);
  return counts[value] ?? 0;
};

// registeredBy may come back populated (e.g. { _id, username }) or as a raw
// ObjectId string, depending on whether the backend .populate()s it — handle
// both. Mirrors AdminDashboard.jsx / ManagerDashboard.jsx exactly.
const getRegisteredBy = (v) => {
  const rb = v.registeredBy;
  if (!rb) return "—";
  if (typeof rb === "string") return rb;
  return rb.username || rb.name || rb._id || "—";
};

// The Plant schema has no dedicated "organization" field — the company name
// is embedded at the start of `location` (e.g. "Kerakoll India Pvt. Ltd.
// Plot No 02-01, 01A & 62, ..."). Heuristic: cut right before "Plot" or the
// first digit (start of the plot/door number), whichever comes first.
// Fragile if a location string is formatted differently — falls back to ""
// rather than showing garbled text. Mirrors AdminDashboard.jsx / ManagerDashboard.jsx exactly.
const extractOrgFromLocation = (location) => {
  if (!location) return "";
  const match = location.match(/^(.*?)(?:\s*,?\s*Plot\b|\s+\d)/i);
  const org = match ? match[1] : "";
  return org.replace(/[,\s]+$/, "").trim();
};

export default function SecurityDashboard({ onLogout }) {
  const navigate = useNavigate();

  const [guard] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ehs_user") || "null");
    } catch {
      return null;
    }
  });

  const [plants, setPlants]               = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(true);
  const [plantsError, setPlantsError]     = useState("");

  // Security is locked to their own plant — no dropdown, no cross-plant
  // visibility. Mirrors how ManagerDashboard.jsx resolves managerPlantId.
  const guardPlantCode =
    typeof guard?.plant === "string"
      ? guard.plant
      : guard?.plant?.plantCode || guard?.plantCode || "";

  const guardPlantId = useMemo(() => {
    if (guard?.plant && typeof guard.plant === "object" && guard.plant._id) {
      return guard.plant._id;
    }
    if (!guardPlantCode) return "";
    return plants.find((p) => p.plantCode === guardPlantCode)?._id || "";
  }, [guard, guardPlantCode, plants]);

  const guardPlantLabel = useMemo(() => {
    if (guard?.plant && typeof guard.plant === "object") {
      return `${guard.plant.plantName || "—"}${guard.plant.location ? ` — ${guard.plant.location}` : ""}`;
    }
    const match = plants.find((p) => p.plantCode === guardPlantCode || p._id === guardPlantId);
    return match ? `${match.plantName}${match.location ? ` — ${match.location}` : ""}` : (guardPlantCode || "—");
  }, [guard, guardPlantCode, guardPlantId, plants]);

  // Full plant record (organization, plantCode, plantName) for the header
  // ribbon — prefer an already-populated guard.plant object, fall back to
  // matching it out of the loaded plants list. Mirrors ManagerDashboard.jsx.
  const guardPlantInfo = useMemo(() => {
    if (guard?.plant && typeof guard.plant === "object" && guard.plant.plantCode) {
      return guard.plant;
    }
    if (!guardPlantCode) return null;
    return plants.find((p) => p.plantCode === guardPlantCode) || null;
  }, [guard, guardPlantCode, plants]);

  const guardOrgName = extractOrgFromLocation(guardPlantInfo?.location);

  const [statusFilter, setStatusFilter] = useState("");
  // Off by default — a Manager's invite does NOT show up here until this is
  // switched on. Even then, pre-gate visitors are shown read-only.
  const [showPipeline, setShowPipeline] = useState(false);

  const [visitors, setVisitors]       = useState([]);
  const [counts, setCounts]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [actioningId, setActioningId] = useState(null);

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

  const loadVisitors = async (plantId, status, includePipeline) => {
    setLoading(true);
    setError("");
    try {
      const data = await listVisitors(plantId || undefined, status || undefined, includePipeline);
      setVisitors(data.visitors);
      setCounts(data.counts);
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
    // Wait for plants to finish loading so guardPlantId has a chance to
    // resolve — firing early risks sending no filter (showing every
    // plant's visitors) or a stale/unresolved value.
    if (plantsLoading) return;
    loadVisitors(guardPlantId, statusFilter, showPipeline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantsLoading, guardPlantId, statusFilter, showPipeline]);

  const runAction = async (id, action) => {
    setActioningId(id);
    setError("");
    try {
      await action(id);
      // The action may move a visitor out of the currently-filtered status
      // (e.g. Check In while filtered to "Ready") — simplest correct
      // behaviour is to just reload the list + counts.
      await loadVisitors(guardPlantId, statusFilter, showPipeline);
    } catch (err) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    onLogout?.();
    navigate("/site", { replace: true });
  };

  const gateVisitors = visitors.filter((v) => !showPipeline || true); // list already scoped server-side

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="text-amber-400"><ShieldIcon /></div>
            <span className="text-lg font-semibold text-white">
              EHS<span className="text-amber-400">360</span>
            </span>
            <span className="hidden sm:inline text-slate-600 mx-2">/</span>
            {guardPlantInfo ? (
              <span className="hidden sm:inline text-slate-400 text-sm">
                {guardOrgName && <span className="text-slate-300">{guardOrgName}</span>}
                {guardOrgName && <span className="text-slate-600 mx-1.5">·</span>}
                <span className="text-amber-300 font-medium">{guardPlantInfo.plantCode}</span>
                <span className="text-slate-600 mx-1.5">·</span>
                {guardPlantInfo.plantName}
              </span>
            ) : (
              <span className="hidden sm:inline text-slate-400 text-sm">Security</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {guard?.username && (
              <span className="hidden sm:block text-sm text-slate-400">
                Signed in as <span className="text-white font-medium">{guard.username}</span>
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

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Gate Check-In</h2>
            <p className="text-slate-400 text-sm mt-1">
              Visitors appear here once their pass is generated — not as soon as a Manager invites them.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 -mt-1">Active statuses are scoped to today — a new day needs a new invite.</p>

        {/* Plant is fixed to the signed-in guard's own plant — read-only,
            no selector, and no other plant's visitors are ever fetched. */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <BuildingIcon />
            Plant
          </label>
          <div className="w-full bg-slate-800/60 border border-slate-700 text-slate-300 rounded-lg px-4 py-3 text-sm">
            {plantsLoading ? "Loading plant…" : plantsError ? "Could not load plant" : guardPlantLabel}
          </div>
          {plantsError && <p className="text-xs text-red-400 mt-1.5">{plantsError}</p>}
        </div>

        <div className="grid grid-cols-6 gap-1 bg-slate-800 rounded-xl p-1">
          {GATE_STATUS_FILTERS.map((f) => (
            <button
              key={f.value || "all"}
              onClick={() => setStatusFilter(f.value)}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg text-[11px] font-medium transition ${
                statusFilter === f.value ? "bg-amber-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="text-sm font-bold">
                {countFor(counts, f.value, f.value ? [f.value] : GATE_STATUS_FILTERS.slice(1).map((x) => x.value))}
              </span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Optional, explicit visibility into pre-gate stages — read-only */}
        <button
          onClick={() => setShowPipeline((v) => !v)}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg py-2.5 transition"
        >
          <EyeIcon />
          {showPipeline ? "Hide pre-gate pipeline (Invited → Assessment Passed)" : "Show pre-gate pipeline (Invited → Assessment Passed)"}
        </button>

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
        ) : gateVisitors.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No visitors match this filter today.</p>
        ) : (
          <div className="space-y-3">
            {gateVisitors.map((v) => {
              const busy = actioningId === v._id;
              const isPreGate = ["DRAFT", "INVITED", "INDUCTION_STARTED", "VIDEO_COMPLETED", "FAILED_ASSESSMENT", "ASSESSMENT_PASSED"].includes(v.status);

              return (
                <div
                  key={v._id}
                  className={`bg-slate-800/60 border rounded-xl p-4 ${isPreGate ? "border-slate-800 opacity-70" : "border-slate-700"}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-white font-semibold text-sm">{v.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{v.phone} · Host: {v.host}</p>
                      {v.plant?.plantName && (
                        <p className="text-slate-500 text-xs mt-0.5">{v.plant.plantName}</p>
                      )}
                      <p className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1">
                        <UserIcon />
                        Created by <span className="font-semibold text-amber-300">{getRegisteredBy(v)}</span>
                      </p>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[v.status]}`}>
                      {STATUS_LABELS[v.status]}
                    </span>
                  </div>

                  {isPreGate && (
                    <p className="text-[11px] text-slate-500 italic mt-1">
                      Not actionable yet — waiting on induction / assessment.
                    </p>
                  )}

                  {v.status === "PASS_GENERATED" && (
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
                      className="w-full mt-3 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg py-2 transition"
                    >
                      {busy ? "…" : "Check Out"}
                    </button>
                  )}

                  {v.status === "CHECKED_OUT" && (
                    <button
                      disabled={busy}
                      onClick={() => runAction(v._id, closeVisitor)}
                      className="w-full mt-3 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-800 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg py-2 transition"
                    >
                      {busy ? "…" : "Close Visit"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}