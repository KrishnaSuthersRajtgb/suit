import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import EHSLoginPage from "./page/Ehsloginpage";
import Dashboard from "./component/Dashboard";
import VisitorDashboard from "./page/Visitordashboard";
import SafetyAssessment from "./page/Safetyassessment";
import VisitorPass from "./page/Visitorpass";
import { useState, useEffect } from "react";
import { getVisitor } from "./services/api";

const VISITOR_ID_KEY = "safeguard_visitor_id";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [visitorData, setVisitorData] = useState(null);
  const [rehydrating, setRehydrating] = useState(true);

  // Router state doesn't survive a page refresh, so persist the visitor's id
  // and re-fetch the full record from the backend on load.
  useEffect(() => {
    const savedId = localStorage.getItem(VISITOR_ID_KEY);
    if (!savedId) {
      setRehydrating(false);
      return;
    }
    getVisitor(savedId)
      .then(({ visitor }) => setVisitorData(visitor))
      .catch(() => localStorage.removeItem(VISITOR_ID_KEY))
      .finally(() => setRehydrating(false));
  }, []);

  // Called by EHSLoginPage after it hits POST /api/visitors/checkin (Visitor tab)
  // or POST /api/visitors/register (Security tab) and gets back { visitor }.
  const handleVisitorCheckin = (visitor) => {
    setVisitorData(visitor);
    localStorage.setItem(VISITOR_ID_KEY, visitor._id);
  };

  const handleSignOut = () => {
    setVisitorData(null);
    localStorage.removeItem(VISITOR_ID_KEY);
  };

  // Source of truth is the visitor record itself, not a separate local flag.
  const inducted = visitorData?.induction?.status === "PASSED";

  if (rehydrating) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login — always accessible */}
        <Route
          path="/"
          element={
            <EHSLoginPage
              onLoginSuccess={() => setIsLoggedIn(true)}
              onVisitorCheckin={handleVisitorCheckin}
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

        {/* Visitor Pass — only after passing the assessment */}
        <Route
          path="/pass"
          element={
            visitorData && inducted
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
                  inducted={inducted}
                  onSignOut={handleSignOut}
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
                  onPass={(updatedVisitor) => setVisitorData(updatedVisitor)}
                />
              : <Navigate to="/" />
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;