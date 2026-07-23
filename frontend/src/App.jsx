import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import EHSLoginPage from "./page/Ehsloginpage";
import StaffLoginPage from "./page/Staffloginpage";
import Dashboard from "./component/Dashboard";
import VisitorDashboard from "./page/Visitordashboard";
import SafetyAssessment from "./page/Safetyassessment";
import VisitorPass from "./page/Visitorpass";
import AdminDashboard from "./page/Admindashboard";
import ManagerDashboard from "./page/Managerdashboard";
import SecurityDashboard from "./page/Securitydashboard"; // adjust path/filename to match your actual file
import { useEffect, useState } from "react";
import { getVisitor } from "./services/api";

const VISITOR_ID_KEY = "ehs_visitor_id";

// Anything at or past ASSESSMENT_PASSED means induction is already done —
// matches the status enum described in services/api.js.
const INDUCTION_COMPLETE_STATUSES = [
  "ASSESSMENT_PASSED",
  "PASS_GENERATED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CLOSED",
];
const isInductionDone = (visitor) =>
  INDUCTION_COMPLETE_STATUSES.includes(visitor?.status);

// A visitor pass is only valid for the day it was registered — once the
// calendar day has moved on, don't silently resume it from localStorage;
// treat it as expired and drop back to a fresh login.
const isSessionExpired = (visitor) => {
  const registered = new Date(visitor?.registeredAt || visitor?.invitedAt || 0);
  const today = new Date();
  return registered.toDateString() !== today.toDateString();
};

// Reads the role off whatever staff user (Admin or Manager) is currently
// stored, so a page refresh doesn't lose the session.
const getStoredRole = () => {
  try {
    return JSON.parse(localStorage.getItem("ehs_user") || "null")?.role || null;
  } catch {
    return null;
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn]       = useState(false);
  const [visitorData, setVisitorData]     = useState(null);
  const [inductionDone, setInductionDone] = useState(false);
  const [rehydrating, setRehydrating]     = useState(true);

  // Single source of truth for "who's logged in on this device right now":
  // "ADMIN", "MANAGER", or null. Admin and Manager share one token slot
  // (kiosk-style — one staff session at a time), so the role decides which
  // of /admin or /manager is unlocked.
  const [staffRole, setStaffRole] = useState(
    () => (localStorage.getItem("ehs_token") ? getStoredRole() : null)
  );

  // On first load, if a visitor previously checked in, restore their
  // session from the backend instead of dropping them back to login on
  // every page refresh.
  useEffect(() => {
    const storedId = localStorage.getItem(VISITOR_ID_KEY);
    if (!storedId) {
      setRehydrating(false);
      return;
    }

   let cancelled = false;
    (async () => {
      try {
        const { visitor } = await getVisitor(storedId);
        if (cancelled) return;

        if (isSessionExpired(visitor)) {
          // Old day's pass — don't resume it, force a fresh check-in.
          localStorage.removeItem(VISITOR_ID_KEY);
          return;
        }

        setVisitorData(visitor);
        setInductionDone(isInductionDone(visitor));
      } catch {
        // Stale/invalid id — clear it and fall back to the login page.
        localStorage.removeItem(VISITOR_ID_KEY);
      } finally {
        if (!cancelled) setRehydrating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleVisitorCheckin = (visitor) => {
    setVisitorData(visitor);
    setInductionDone(isInductionDone(visitor));
    if (visitor?._id) localStorage.setItem(VISITOR_ID_KEY, visitor._id);
  };

  const handleVisitorSignOut = () => {
    setVisitorData(null);
    setInductionDone(false);
    localStorage.removeItem(VISITOR_ID_KEY);
  };

  // Shared by AdminForm / ManagerLoginForm / SecurityLoginForm on the
  // Staffloginpage.jsx — the token is already stashed in localStorage by the
  // form itself, we just need the user's role to know which dashboard route
  // to unlock.
  const handleStaffLoginSuccess = (user) => {
    if (user) localStorage.setItem("ehs_user", JSON.stringify(user));
    setStaffRole(user?.role || null);
  };

  const handleStaffLogout = () => {
    setStaffRole(null);
  };

  // Avoid a flash of the login page while we check for a saved session.
  if (rehydrating) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Visitor Login — public, default landing page. No staff options shown. */}
        <Route
          path="/"
          element={
            <EHSLoginPage
              onLoginSuccess={() => setIsLoggedIn(true)}
              onVisitorCheckin={handleVisitorCheckin}
            />
          }
        />

        {/* Staff Login — separate URL. Security/Admin/Manager sign-in lives
            ONLY here; visitors never see or reach this from "/". */}
        <Route
          path="/site"
          element={
            <StaffLoginPage
              onStaffLoginSuccess={handleStaffLoginSuccess}
            />
          }
        />

        {/* Employee Dashboard */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn
              ? <Dashboard onLogout={() => setIsLoggedIn(false)} />
              : <Navigate to="/" />
          }
        />

        {/* Admin Dashboard — full visibility across visitor/security/manager data */}
        <Route
          path="/admin"
          element={
            staffRole === "ADMIN"
              ? <AdminDashboard onLogout={handleStaffLogout} />
              : <Navigate to="/site" />
          }
        />

        {/* Manager Dashboard — approve incoming visitors */}
        <Route
          path="/manager"
          element={
            staffRole === "MANAGER"
              ? <ManagerDashboard onLogout={handleStaffLogout} />
              : <Navigate to="/site" />
          }
        />

        {/* Visitor Pass — only after passing the assessment */}
        <Route
          path="/pass"
          element={
            visitorData && inductionDone
              ? <VisitorPass visitor={visitorData} />
              : <Navigate to="/" />
          }
        />

        {/* Visitor Dashboard */}
        <Route
          path="/visitor"
          element={
            visitorData
              ? <VisitorDashboard
                  visitor={visitorData}
                  inducted={inductionDone}
                  onSignOut={handleVisitorSignOut}
                />
              : <Navigate to="/" />
          }
        />

        {/* Safety Assessment — only reachable after visitor check-in */}
        <Route
          path="/assessment"
          element={
            visitorData
              ? <SafetyAssessment
                  visitor={visitorData}
                  onPass={() => setInductionDone(true)}
                />
              : <Navigate to="/" />
          }
        />
        {/* Security Dashboard — gate check-in/out */}
        <Route
          path="/security"
          element={
            staffRole === "SECURITY"
              ? <SecurityDashboard onLogout={handleStaffLogout} />
              : <Navigate to="/site" />
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;