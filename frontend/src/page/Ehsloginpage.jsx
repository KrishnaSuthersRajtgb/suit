import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

const localStorageKeyFor = (phone) => `ehs_visitor_${phone.trim()}`;

// ─────────────────────────────────────────────────────────────────────────────
// ── Visitor Form ────────────────────────────────────────────────────────────────
// Asks for a PHONE NUMBER only.
// On submit, it looks up `ehs_visitor_<phone>` in localStorage.
// - If found  → uses the security-registered data to log the visitor in.
// - If absent → tells the visitor to register at Security first.
// ─────────────────────────────────────────────────────────────────────────────
function VisitorForm({ onVisitorCheckin }) {
  const navigate = useNavigate();
  const [phone, setPhone]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const stored = localStorage.getItem(localStorageKeyFor(phone));

      if (!stored) {
        setError("No record found for this number. Please check in at Security first.");
        setLoading(false);
        return;
      }

      try {
        const visitorData = JSON.parse(stored);
        onVisitorCheckin?.(visitorData);
        navigate("/visitor");
      } catch {
        setError("Stored visitor record is corrupted. Please re-register at Security.");
        setLoading(false);
      }
    }, 600);
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
          Enter the phone number that Security used to register your visit.
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
// ── Security Form ───────────────────────────────────────────────────────────────
// Full visitor registration form.
// On submit, the full record is saved to localStorage under the visitor's
// phone number (key: ehs_visitor_<phone>), so they can later check in via
// the Visitor tab using just that number.
// ─────────────────────────────────────────────────────────────────────────────
function SecurityForm() {
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [company, setCompany] = useState("");
  const [purpose, setPurpose] = useState("");
  const [host, setHost]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim())    { setError("Full name is required."); return; }
    if (!phone.trim())   { setError("Phone number is required."); return; }
    if (!purpose.trim()) { setError("Purpose of visit is required."); return; }
    if (!host.trim())    { setError("Host employee name is required."); return; }

    setLoading(true);
    setTimeout(() => {
      const visitorData = {
        name: name.trim(),
        phone: phone.trim(),
        company: company.trim(),
        purpose,
        host: host.trim(),
      };

      localStorage.setItem(localStorageKeyFor(phone), JSON.stringify(visitorData));

      setSuccess(
        `Registered "${visitorData.name}". They can now check in from the Visitor tab using ${visitorData.phone}.`
      );

      // reset form
      setName(""); setPhone(""); setCompany(""); setPurpose(""); setHost("");
      setLoading(false);
    }, 600);
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
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
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
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
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
          className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
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
          className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Purpose of Visit <span className="text-red-400">*</span>
        </label>
        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
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
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 text-sm transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            Registering…
          </>
        ) : "Register Visitor"}
      </button>
    </form>
  );
}

// ── Main Login Page ────────────────────────────────────────────────────────────
export default function EHSLoginPage({ onLoginSuccess, onVisitorCheckin }) {
  // Employee tab removed from UI — defaulting to "visitor".
  const [tab, setTab] = useState("visitor");

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
          <div className="flex bg-slate-800 rounded-xl p-1 mb-6">
            <button
              onClick={() => setTab("visitor")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                tab === "visitor" ? "bg-blue-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
              </svg>
              Visitor
            </button>
            <button
              onClick={() => setTab("security")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                tab === "security" ? "bg-amber-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <LockIcon />
              Security
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
              <p className="text-slate-400 text-sm mb-5">Register an incoming visitor's details before they arrive.</p>
              <SecurityForm />
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