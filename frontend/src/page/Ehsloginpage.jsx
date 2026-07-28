import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { checkinVisitor } from "../services/api";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// ── Visitor Form ──────────────────────────────────────────────────────────────
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

  // A visitor record is only good for the day it was registered — if the
// backend hands back an older visit (e.g. this phone number's last approved
// visit was days ago and already ran its course), don't log the visitor
// into that stale pass.
const isStaleVisit = (visitor) => {
  const registered = new Date(visitor?.registeredAt || visitor?.invitedAt || 0);
  const today = new Date();
  return registered.toDateString() !== today.toDateString();
};

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

      if (isStaleVisit(visitor)) {
        setError("Your last approved visit has expired. Please contact your host to schedule a new visit.");
        return;
      }

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

// ── Main Login Page (VISITOR ONLY) ──────────────────────────────────────────
// Lives at "/". Staff (Security / Admin / Manager) never appear here at all —
// that login lives on its own route, see page/Staffloginpage.jsx at "/site".
// ────────────────────────────────────────────────────────────────────────────
export default function EHSLoginPage({ onVisitorCheckin }) {
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
            <h2 className="text-2xl font-bold text-white">Kerakoll India Private Limited</h2>
            <h2 className="text-2xl font-bold text-white">Welcome</h2>
            <p className="text-slate-400 text-sm mt-1">Enter your phone number to check in for your visit.</p>
          </div>

          <VisitorForm onVisitorCheckin={onVisitorCheckin} />

          <p className="text-center text-xs text-slate-600 mt-6">
            Having trouble? Contact{" "}
            <span className="text-slate-400 hover:text-emerald-400 cursor-pointer transition">IT Support</span>{" "}
            or your site administrator.
          </p>

          {/* Deliberately no visible Security/Admin/Manager tabs here.
              Staff go to /site directly (bookmark, kiosk shortcut, etc). */}
        </div>
      </div>
    </div>
  );
}