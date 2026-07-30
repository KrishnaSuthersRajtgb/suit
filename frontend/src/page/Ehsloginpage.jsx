import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { checkinVisitor } from "../services/api";

const BASKERVILLE = "'Baskerville', 'Baskerville Old Face', Georgia, serif";
const MOSS_GREEN = "#8A9A5B";

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
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-white border border-slate-300 text-slate-800 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] focus:border-transparent transition"
        />
        <p className="text-xs text-slate-500 mt-2">
          Enter the phone number your visit was approved under.
        </p>
      </div>

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
    <div className="min-h-screen bg-white flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col p-12 bg-white border-r border-slate-200">
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
          Visitor Safety Induction
        </h2>

        <div className="mt-auto flex items-center gap-4">
          <img
            src="/ehs.png"
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
            {/* <h2 className="text-2xl font-bold text-slate-800">Kerakoll India Private Limited</h2> */}
            <h2 className="text-2xl font-bold text-slate-800">Welcome</h2>
            <p className="text-slate-500 text-sm mt-1">Enter your phone number to check in for your visit.</p>
          </div>

          <VisitorForm onVisitorCheckin={onVisitorCheckin} />

          {/* Deliberately no visible Security/Admin/Manager tabs here.
              Staff go to /site directly (bookmark, kiosk shortcut, etc). */}
        </div>
      </div>
    </div>
  );
}