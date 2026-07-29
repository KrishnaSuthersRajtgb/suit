import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlants, login } from "../services/api";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M4 2a1 1 0 00-1 1v15a1 1 0 001 1h4v-3a1 1 0 011-1h2a1 1 0 011 1v3h4a1 1 0 001-1V3a1 1 0 00-1-1H4zm2 3a1 1 0 011-1h1a1 1 0 010 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1zM6 9a1 1 0 011-1h1a1 1 0 010 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1zM6 13a1 1 0 011-1h1a1 1 0 110 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1z" clipRule="evenodd" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// ── Shared Plant <select> (unchanged) ────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function PlantSelect({ value, onChange, plants, plantsLoading, plantsError, label = "Plant", required = true }) {
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
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <option value="">
          {plantsLoading ? "Loading plants…" : plantsError ? "Could not load plants" : "Select plant…"}
        </option>
        {plants.map((p) => (
  <option key={p._id} value={p.plantCode}>
    {p.plantName} — {p.plantCode}
  </option>
))}
      </select>
      {plantsError && <p className="text-xs text-red-400 mt-1.5">{plantsError}</p>}
    </div>
  );
}

// Where each role lands after a successful login — matches App.jsx's route
// guards (staffRole === "ADMIN" → /admin, etc).
const ROLE_DESTINATIONS = {
  ADMIN: "/admin",
  MANAGER: "/manager",
  SECURITY: "/security",
};

// ── Staff Login Page ────────────────────────────────────────────────────────
// Lives at "/site". Still the ONLY place staff logins are shown — the main
// visitor page at "/" never links to or reveals this. Reach it by typing the
// URL directly, or bookmark/shortcut for kiosk staff.
//
// Uses the single unified login() call — the backend looks the user up by
// username only and returns their real role, so there's no more trying
// loginAdmin/loginManager/loginSecurity in sequence (and no more "wrong
// door" 401s in the network tab/server logs for the roles that don't match).
// ────────────────────────────────────────────────────────────────────────────
export default function StaffLoginPage({ onStaffLoginSuccess }) {
  const navigate = useNavigate();

  const [plants, setPlants]               = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(true);
  const [plantsError, setPlantsError]     = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [plant, setPlant]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) { setError("Username is required."); return; }
    if (!password.trim()) { setError("Password is required."); return; }
    if (!plant)            { setError("Plant is required."); return; }

    setLoading(true);
    try {
      const data = await login({
        username: username.trim(),
        password,
        plant,
      });

      const destination = ROLE_DESTINATIONS[data.user?.role];
      if (!destination) {
        throw new Error("This account's role isn't recognized. Contact your administrator.");
      }

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
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border-r border-slate-800">
        <div className="flex items-center gap-3">
          <ShieldIcon />
          <span className="text-xl font-semibold text-white">EHS<span className="text-emerald-400">360</span></span>
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
            Staff sign-in for EHS 360. Not for visitor check-in.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="text-emerald-400"><ShieldIcon /></div>
          <span className="text-lg font-semibold text-white">EHS<span className="text-emerald-400">360</span></span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Kerakoll India Private Limited</h1>
            <h2 className="text-2xl font-bold text-white">Staff Sign In</h2>
            <p className="text-slate-400 text-sm mt-1">Sign in with your credentials.</p>
          </div>

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
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
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
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <PlantSelect
              value={plant}
              onChange={setPlant}
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
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 text-sm transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Signing in…
                </>
              ) : "Sign In"}
            </button>
          </form>

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