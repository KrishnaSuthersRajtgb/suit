import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlants, login } from "../services/api";

const BASKERVILLE = "'Baskerville', 'Baskerville Old Face', Georgia, serif";
const MOSS_GREEN = "#8A9A5B";
const MOSS_GREEN_DARK = "#78875030";

const BuildingIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M4 2a1 1 0 00-1 1v15a1 1 0 001 1h4v-3a1 1 0 011-1h2a1 1 0 011 1v3h4a1 1 0 001-1V3a1 1 0 00-1-1H4zm2 3a1 1 0 011-1h1a1 1 0 010 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1zM6 9a1 1 0 011-1h1a1 1 0 010 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1zM6 13a1 1 0 011-1h1a1 1 0 110 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1z" clipRule="evenodd" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// ── Shared Plant <select> (unchanged logic, restyled) ────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function PlantSelect({ value, onChange, plants, plantsLoading, plantsError, label = "Plant", required = true }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
        <BuildingIcon />
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={plantsLoading || !!plantsError}
        className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
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
      {plantsError && <p className="text-xs text-red-500 mt-1.5">{plantsError}</p>}
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
    <div className="min-h-screen bg-white flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col p-12 bg-white border-r border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl font-bold text-slate-800 tracking-tight">EHS 360</span>
          {/* <span className="text-4xl font-bold text-slate-800 tracking-tight">kerakoll</span> */}
        </div>
        <div className="flex items-center gap-3 mb-6">
          <img
            src="/logo.png"
            alt="Kerakoll"
            className="h-12 w-auto object-contain"
          />
        </div>
        <h1
          className="text-5xl font-bold mb-10"
          style={{ color: MOSS_GREEN, fontFamily: BASKERVILLE }}
        >
          HSE
        </h1>
        <h2
          className="text-3xl text-slate-600"
          style={{ fontFamily: BASKERVILLE }}
        >
          EHS Suit
        </h2>

        <div className="mt-auto flex items-center gap-4">
          <img
            src="/image.png"
            alt="EHS 360"
            className="w-16 h-16 rounded-xl object-contain shrink-0"
          />
          <div>
            <p
              className="text-2xl font-semibold mb-1"
              style={{ color: MOSS_GREEN, fontFamily: BASKERVILLE }}
            >
              Health . Safety . Environment
            </p>
            <p
              className="text-lg font-semibold text-slate-700"
              style={{ fontFamily: BASKERVILLE }}
            >
              Building a safer environment together
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto bg-[#A6A6A6]">
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <img
            src="/logo.png"
            alt="Kerakoll"
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            {/* <h1 className="text-2xl font-bold text-slate-800">Kerakoll India Private Limited</h1> */}
            <h2 className="text-2xl font-bold text-slate-800">Staff Sign In</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="your.username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] focus:border-transparent transition"
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
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5 shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold rounded-full py-3 text-sm transition flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              style={{ backgroundColor: loading ? "#a9b587" : MOSS_GREEN }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#78874f"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = MOSS_GREEN; }}
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
        </div>
      </div>
    </div>
  );
}