import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const navLinks = [
  { label: "Incidents",   href: "/incidents" },
  { label: "Checklists",  href: "/checklists" },
  { label: "Compliance",  href: "/compliance" },
  { label: "Hazard Logs", href: "/hazards" },
];

const roleBadgeColor = {
  Admin:    "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Manager:  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Employee: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

export default function Navbar({
  user = { name: "Ravi Kumar", role: "Manager", employeeId: "EMP-00421" },
  onLogout,
  activePage = "Dashboard",
}) {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications]               = useState(3);
  const navigate = useNavigate();

  const handleLogout = () => {
    setProfileOpen(false);
    onLogout?.();
    navigate("/", { replace: true });
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left — Logo + Dashboard link */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5 text-emerald-400">
              <ShieldIcon />
              <div className="hidden sm:block">
                <span className="text-white font-semibold text-base">SafeGuard</span>
                <span className="text-emerald-400 font-semibold text-base"> EHS</span>
              </div>
            </div>

            {/* Dashboard — always left, separated by a divider */}
            <div className="hidden md:flex items-center">
              <div className="w-px h-5 bg-slate-700 mr-5" />
              <a
                href="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePage === "Dashboard"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                Dashboard
              </a>
            </div>
          </div>

          {/* Center — other nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePage === link.label
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right — bell + profile */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
              <BellIcon />
              {notifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-sm font-bold">
                  {user.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-white text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{user.employeeId}</p>
                </div>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-500">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-700">
                    <p className="text-white text-sm font-medium">{user.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleBadgeColor[user.role] || roleBadgeColor.Employee}`}>
                        {user.role}
                      </span>
                      <span className="text-slate-500 text-xs">{user.employeeId}</span>
                    </div>
                  </div>
                  <div className="py-1">
                    {[
                      { label: "My Profile", icon: "👤" },
                      { label: "Settings",   icon: "⚙️" },
                      { label: "My Reports", icon: "📄" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center gap-3"
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-700 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300 transition flex items-center gap-3"
                    >
                      <span>🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1">
          <a
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              activePage === "Dashboard"
                ? "bg-emerald-500/15 text-emerald-400"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            onClick={() => setMobileOpen(false)}
          >
            📊 Dashboard
          </a>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activePage === link.label
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}