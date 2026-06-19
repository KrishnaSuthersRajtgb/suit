import { useState } from "react";
import { useNavigate } from "react-router-dom";

const statCards = [
  {
    label: "Open Incidents", value: "12", change: "+2 this week",
    color: "text-red-400", bg: "bg-red-500/10 border-red-500/20",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>,
  },
  {
    label: "Checklists Due", value: "7", change: "3 overdue",
    color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  },
  {
    label: "Compliance Rate", value: "98.3%", change: "+0.4% vs last month",
    color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  },
  {
    label: "Active Hazards", value: "5", change: "-1 resolved today",
    color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>,
  },
];

const recentIncidents = [
  { id: "INC-0091", title: "Chemical spill — Lab B",        site: "Site 3", severity: "High",   status: "Open",         date: "13 Jun 2026" },
  { id: "INC-0090", title: "Slip & fall — Warehouse floor", site: "Site 1", severity: "Medium", status: "Under Review", date: "12 Jun 2026" },
  { id: "INC-0089", title: "Forklift near-miss",            site: "Site 2", severity: "High",   status: "Open",         date: "11 Jun 2026" },
  { id: "INC-0088", title: "PPE non-compliance",            site: "Site 1", severity: "Low",    status: "Closed",       date: "10 Jun 2026" },
  { id: "INC-0087", title: "Fire extinguisher missing",     site: "Site 4", severity: "Medium", status: "Closed",       date: "09 Jun 2026" },
];

const hazardLogs = [
  { id: "HAZ-031", description: "Exposed wiring near pump station", location: "Site 2 — Block C",    level: "Critical", assignedTo: "Electrical Team", due: "14 Jun 2026" },
  { id: "HAZ-030", description: "Slippery walkway (oil residue)",   location: "Site 1 — Main Entry", level: "High",     assignedTo: "Maintenance",     due: "15 Jun 2026" },
  { id: "HAZ-029", description: "Improper chemical storage",        location: "Site 3 — Lab B",      level: "High",     assignedTo: "Safety Officer",  due: "16 Jun 2026" },
  { id: "HAZ-028", description: "Blocked emergency exit",           location: "Site 4 — Floor 2",    level: "Medium",   assignedTo: "Facility Mgr",    due: "17 Jun 2026" },
];

const checklists = [
  { name: "Daily Fire Safety Walk",      site: "Site 1", assignedTo: "Ravi K.",  due: "Today",     completion: 100, status: "Done"        },
  { name: "Weekly Equipment Inspection", site: "Site 2", assignedTo: "Arjun S.", due: "Today",     completion: 60,  status: "In Progress" },
  { name: "Monthly PPE Audit",           site: "Site 3", assignedTo: "Priya M.", due: "Yesterday", completion: 0,   status: "Overdue"     },
  { name: "Chemical Storage Review",     site: "Site 3", assignedTo: "Meena T.", due: "15 Jun",    completion: 30,  status: "In Progress" },
];

const severityBadge = {
  High:     "bg-red-500/15 text-red-400 border border-red-500/30",
  Critical: "bg-red-600/20 text-red-300 border border-red-600/40",
  Medium:   "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  Low:      "bg-slate-700 text-slate-400 border border-slate-600",
};

const statusBadge = {
  Open:           "bg-red-500/15 text-red-400",
  "Under Review": "bg-blue-500/15 text-blue-400",
  Closed:         "bg-emerald-500/15 text-emerald-400",
  Done:           "bg-emerald-500/15 text-emerald-400",
  "In Progress":  "bg-blue-500/15 text-blue-400",
  Overdue:        "bg-red-500/15 text-red-400",
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { label: "Incidents", href: "/incidents", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg> },
  { label: "Checklists", href: "/checklists", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
  { label: "Compliance", href: "/compliance", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
  { label: "Hazard Logs", href: "/hazards", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg> },
];

// ── Sidebar (desktop) ──────────────────────────────────────────────────────────
function Sidebar({ activePage, user, onLogout, onClose }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <aside className="h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo + close button (mobile) */}
      <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-emerald-400">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <span className="text-lg font-semibold text-white">SafeGuard <span className="text-emerald-400">EHS</span></span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.label;
          return (
            <a
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
            >
              <span className={isActive ? "text-emerald-400" : "text-slate-500"}>{item.icon}</span>
              {item.label}
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </a>
          );
        })}
      </nav>

      {/* Report button */}
      <div className="px-3 pb-3">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /></svg>
          Report Incident
        </button>
      </div>

      {/* User */}
      <div className="border-t border-slate-800 px-3 py-3 relative">
        <button
          onClick={() => setProfileOpen((p) => !p)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800 transition"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold shrink-0">
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className="text-slate-500 text-xs truncate">{user.role}</p>
          </div>
          <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${profileOpen ? "rotate-180" : ""}`}>
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {profileOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-white font-semibold text-sm">{user.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">{user.role}</span>
                <span className="text-slate-500 text-xs">{user.employeeId}</span>
              </div>
            </div>
            <div className="py-1">
              {["My Profile", "Settings", "My Reports"].map((label) => (
                <button key={label} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition text-left">
                  {label}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-700 py-1">
              <button
                onClick={() => { setProfileOpen(false); onLogout?.(); navigate("/", { replace: true }); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/40 transition text-left"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 000-2H4V5h6a1 1 0 000-2H3zm11.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L15.586 12H9a1 1 0 010-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export default function Dashboard({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = { name: "Ravi Kumar", role: "Manager", employeeId: "EMP-00421" };

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* ── Desktop sidebar ── fixed, always visible on lg+ */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:z-30">
        <Sidebar activePage="Dashboard" user={user} onLogout={onLogout} />
      </div>

      {/* ── Mobile sidebar ── drawer overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative flex w-64 flex-col">
            <Sidebar
              activePage="Dashboard"
              user={user}
              onLogout={onLogout}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">

        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition shrink-0"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white truncate">Good morning, Ravi 👋</h1>
            <p className="text-slate-500 text-xs hidden sm:block">EHS overview — 13 June 2026</p>
          </div>

          <button className="relative w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a2 2 0 002-2H8a2 2 0 002 2z" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950" />
          </button>
        </div>

        {/* Page body */}
        <main className="flex-1 px-4 sm:px-6 py-5 sm:py-6 space-y-5">

          {/* Stat cards — 2 cols on mobile, 4 on lg */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statCards.map((card) => (
              <div key={card.label} className={`rounded-xl border p-4 sm:p-5 ${card.bg}`}>
                <div className={`${card.color} mb-2 sm:mb-3`}>{card.icon}</div>
                <div className={`text-2xl sm:text-3xl font-bold ${card.color}`}>{card.value}</div>
                <div className="text-slate-300 text-xs sm:text-sm font-medium mt-0.5">{card.label}</div>
                <div className="text-slate-500 text-xs mt-1 hidden sm:block">{card.change}</div>
              </div>
            ))}
          </div>

          {/* Incidents + Hazards — stack on mobile, side-by-side on xl */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Recent Incidents */}
            <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800">
                <h2 className="text-white font-semibold text-sm sm:text-base">Recent Incidents</h2>
                <a href="/incidents" className="text-emerald-400 text-xs sm:text-sm hover:text-emerald-300 transition">View all →</a>
              </div>

              {/* Table — hidden on very small, card list on mobile */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {["ID", "Title", "Site", "Severity", "Status", "Date"].map((h) => (
                        <th key={h} className="text-left px-4 sm:px-5 py-3 text-slate-500 text-xs font-medium uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentIncidents.map((inc, i) => (
                      <tr key={inc.id} className={`border-b border-slate-800/60 hover:bg-slate-800/40 transition ${i === recentIncidents.length - 1 ? "border-none" : ""}`}>
                        <td className="px-4 sm:px-5 py-3.5 text-emerald-400 font-mono text-xs whitespace-nowrap">{inc.id}</td>
                        <td className="px-4 sm:px-5 py-3.5 text-slate-200 text-xs sm:text-sm">{inc.title}</td>
                        <td className="px-4 sm:px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">{inc.site}</td>
                        <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityBadge[inc.severity]}`}>{inc.severity}</span>
                        </td>
                        <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[inc.status]}`}>{inc.status}</span>
                        </td>
                        <td className="px-4 sm:px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">{inc.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden divide-y divide-slate-800">
                {recentIncidents.map((inc) => (
                  <div key={inc.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-slate-200 text-sm font-medium">{inc.title}</span>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${severityBadge[inc.severity]}`}>{inc.severity}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-emerald-400 font-mono text-xs">{inc.id}</span>
                      <span className="text-slate-500 text-xs">·</span>
                      <span className="text-slate-400 text-xs">{inc.site}</span>
                      <span className="text-slate-500 text-xs">·</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[inc.status]}`}>{inc.status}</span>
                      <span className="text-slate-600 text-xs ml-auto">{inc.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Hazards */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-800">
                <h2 className="text-white font-semibold text-sm sm:text-base">Active Hazards</h2>
                <a href="/hazards" className="text-emerald-400 text-xs sm:text-sm hover:text-emerald-300 transition">View all →</a>
              </div>
              <div className="divide-y divide-slate-800">
                {hazardLogs.map((h) => (
                  <div key={h.id} className="px-4 sm:px-5 py-4 hover:bg-slate-800/40 transition">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-slate-200 text-sm leading-snug">{h.description}</span>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${severityBadge[h.level]}`}>{h.level}</span>
                    </div>
                    <p className="text-slate-500 text-xs">{h.location}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-slate-600 text-xs">→ {h.assignedTo}</span>
                      <span className="text-slate-600 text-xs">Due {h.due}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checklists */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800">
              <h2 className="text-white font-semibold text-sm sm:text-base">Safety Checklists</h2>
              <a href="/checklists" className="text-emerald-400 text-xs sm:text-sm hover:text-emerald-300 transition">View all →</a>
            </div>
            <div className="divide-y divide-slate-800">
              {checklists.map((c) => (
                <div key={c.name} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-slate-800/40 transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-slate-200 text-sm font-medium">{c.name}</span>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[c.status]}`}>{c.status}</span>
                    </div>
                    <p className="text-slate-500 text-xs">{c.site} · {c.assignedTo} · Due {c.due}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-full sm:w-28 bg-slate-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${c.status === "Overdue" ? "bg-red-500" : c.completion === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                        style={{ width: `${c.completion}%` }}
                      />
                    </div>
                    <span className="text-slate-500 text-xs w-8 text-right shrink-0">{c.completion}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}