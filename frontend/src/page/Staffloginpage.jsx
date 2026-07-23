import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPlants,
  loginAdmin,
  loginManager,
  loginSecurity,
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
// ── Generic staff login form ─────────────────────────────────────────────────
// Shared shape for Admin / Manager / Security — only the API call, accent
// color, destination route, and copy differ.
// ─────────────────────────────────────────────────────────────────────────────
function StaffLoginForm({ loginFn, accent, destination, submitLabel, onStaffLoginSuccess, plants, plantsLoading, plantsError }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [plant, setPlant]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const ACCENT = {
    purple: {
      ring: "focus:ring-purple-500",
      btn: "bg-purple-500 hover:bg-purple-400 disabled:bg-purple-800",
    },
    teal: {
      ring: "focus:ring-teal-500",
      btn: "bg-teal-500 hover:bg-teal-400 disabled:bg-teal-800",
    },
    amber: {
      ring: "focus:ring-amber-500",
      btn: "bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800",
    },
  }[accent];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) { setError("Username is required."); return; }
    if (!password.trim()) { setError("Password is required."); return; }
    if (!plant)            { setError("Plant is required."); return; }

    setLoading(true);
    try {
      const data = await loginFn({ username: username.trim(), password, plant });

      localStorage.setItem("ehs_token", data.token);
      onStaffLoginSuccess?.(data.user);
      navigate(destination);
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
          placeholder="your.username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={`w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 ${ACCENT.ring} focus:border-transparent transition`}
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
          className={`w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 ${ACCENT.ring} focus:border-transparent transition`}
        />
      </div>

      <PlantSelect
        value={plant}
        onChange={setPlant}
        focusRingClass={ACCENT.ring}
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
        className={`w-full ${ACCENT.btn} disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 text-sm transition flex items-center justify-center gap-2`}
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            Signing in…
          </>
        ) : submitLabel}
      </button>
    </form>
  );
}

// ── Staff Login Page ────────────────────────────────────────────────────────
// Lives at "/site". This is the ONLY place Security/Admin/Manager logins are
// shown — the main visitor page at "/" never links to or reveals this.
// Reach it by typing the URL directly, or bookmark/shortcut for kiosk staff.
// ────────────────────────────────────────────────────────────────────────────
export default function StaffLoginPage({ onStaffLoginSuccess }) {
  const [tab, setTab] = useState("security");

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
            Staff Access
          </span>
          <h1 className="text-4xl font-bold text-white leading-tight mt-4 mb-4">
            Manage the site.
            <br />
            <span className="text-emerald-400">Keep it safe.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Security, Admin, and Manager sign-in for SafeGuard EHS. Not for visitor check-in.
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
            <h2 className="text-2xl font-bold text-white">Staff Sign In</h2>
            <p className="text-slate-400 text-sm mt-1">Select your role and sign in with your credentials.</p>
          </div>

          {/* Tabs — Security / Admin / Manager only, no Visitor tab here */}
          <div className="grid grid-cols-3 gap-1 bg-slate-800 rounded-xl p-1 mb-6">
            <button
              onClick={() => setTab("security")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                tab === "security" ? "bg-amber-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <LockIcon />
              <span>Security</span>
            </button>
            <button
              onClick={() => setTab("admin")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                tab === "admin" ? "bg-purple-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <UserGearIcon />
              <span>Admin</span>
            </button>
            <button
              onClick={() => setTab("manager")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                tab === "manager" ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <BriefcaseIcon />
              <span>Manager</span>
            </button>
          </div>

          {tab === "security" && (
            <>
              <p className="text-slate-400 text-sm mb-5">Sign in with your security credentials.</p>
              <StaffLoginForm
                loginFn={loginSecurity}
                accent="amber"
                destination="/security"
                submitLabel="Sign In as Security"
                onStaffLoginSuccess={onStaffLoginSuccess}
                plants={plants}
                plantsLoading={plantsLoading}
                plantsError={plantsError}
              />
            </>
          )}

          {tab === "admin" && (
            <>
              <p className="text-slate-400 text-sm mb-5">Sign in with your admin credentials.</p>
              <StaffLoginForm
                loginFn={loginAdmin}
                accent="purple"
                destination="/admin"
                submitLabel="Sign In as Admin"
                onStaffLoginSuccess={onStaffLoginSuccess}
                plants={plants}
                plantsLoading={plantsLoading}
                plantsError={plantsError}
              />
            </>
          )}

          {tab === "manager" && (
            <>
              <p className="text-slate-400 text-sm mb-5">Sign in with your manager credentials.</p>
              <StaffLoginForm
                loginFn={loginManager}
                accent="teal"
                destination="/manager"
                submitLabel="Sign In as Manager"
                onStaffLoginSuccess={onStaffLoginSuccess}
                plants={plants}
                plantsLoading={plantsLoading}
                plantsError={plantsError}
              />
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