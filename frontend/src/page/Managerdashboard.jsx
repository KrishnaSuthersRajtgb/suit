import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getPlants, registerVisitor, logoutAdmin } from "../services/api";

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

// Local YYYY-MM-DD for the date input's default value/min — avoids the UTC
// off-by-one day that toISOString() can introduce near midnight.
const todayLocalISO = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
};

// ─────────────────────────────────────────────────────────────────────────────
// This creates the visitor record at status INVITED — it does NOT put them
// in Security's gate queue yet. The visitor still has to log in, complete
// induction (video + quiz), and have their pass generated before Security
// sees them — and only on the visit date selected below. See
// visitorController.js TRANSITIONS for the full pipeline.
// ─────────────────────────────────────────────────────────────────────────────
function InviteVisitorForm({ plants, plantsLoading, plantsError, managerPlant }) {
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

      setSuccess(data.message);

      // reset form — keep the manager's plant prefilled instead of clearing it
      setName(""); setPhone(""); setCompany(""); setPurpose(""); setHost("");
      setPlant(managerPlant || "");
      setVisitDate(todayLocalISO());
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
        className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 text-sm transition flex items-center justify-center gap-2"
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

  const [plants, setPlants]           = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(true);
  const [plantsError, setPlantsError] = useState("");

  // Invite Visitor sits behind its own button now — the form only shows
  // once the Manager clicks it, same pattern as Admin's action buttons.
  const [showInviteForm, setShowInviteForm] = useState(false);

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

  const handleLogout = () => {
    logoutAdmin();
    onLogout?.();
    navigate("/site", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="text-teal-400"><ShieldIcon /></div>
            <span className="text-lg font-semibold text-white">
              SafeGuard <span className="text-teal-400">EHS</span>
            </span>
            <span className="hidden sm:inline text-slate-600 mx-2">/</span>
            <span className="hidden sm:inline text-slate-400 text-sm">Manager</span>
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

      <main className="max-w-2xl mx-auto px-6 py-10">
        {!showInviteForm ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Manager Dashboard</h2>
              <p className="text-slate-400 text-sm mt-1">
                Invite visitors for your plant. They'll need to check in, complete safety induction,
                and pass the assessment before a pass is generated.
              </p>
            </div>

            {/* Separate standalone button — same pattern as Admin's action
                buttons. Clicking it opens the Invite Visitor form below. */}
            <button
              onClick={() => setShowInviteForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm font-semibold rounded-full pl-5 pr-4 py-2.5 shadow-lg shadow-black/20 transition transform hover:scale-[1.03] hover:brightness-110"
            >
              <PlusIcon />
              Invite Visitor
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowInviteForm(false)}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition mb-6"
            >
              <ChevronLeftIcon />
              Back
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Invite a Visitor</h2>
              <p className="text-slate-400 text-sm mt-1">
                They'll need to check in, complete safety induction, and pass the assessment before
                a pass is generated — only then will Security see them at the gate, on the visit date you select.
              </p>
            </div>
            <InviteVisitorForm
              plants={plants}
              plantsLoading={plantsLoading}
              plantsError={plantsError}
              managerPlant={
                typeof manager?.plant === "string"
                  ? manager.plant
                  : manager?.plant?.plantCode || manager?.plantCode || ""
              }
            />
          </>
        )}
      </main>
    </div>
  );
}