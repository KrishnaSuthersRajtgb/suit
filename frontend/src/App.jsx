import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import EHSLoginPage from "./page/Ehsloginpage";
import Dashboard from "./component/Dashboard";
import VisitorDashboard from "./page/Visitordashboard";
import SafetyAssessment from "./page/Safetyassessment";
import VisitorPass from "./page/Visitorpass";
import { useEffect, useState } from "react";
import { getVisitor } from "./services/api";

const VISITOR_ID_KEY = "ehs_visitor_id";

function App() {
  const [isLoggedIn, setIsLoggedIn]       = useState(false);
  const [visitorData, setVisitorData]     = useState(null);
  const [inductionDone, setInductionDone] = useState(false);
  const [rehydrating, setRehydrating]     = useState(true);

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
        setVisitorData(visitor);
        setInductionDone(visitor.induction?.status === "PASSED");
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
    setInductionDone(visitor?.induction?.status === "PASSED");
    if (visitor?._id) localStorage.setItem(VISITOR_ID_KEY, visitor._id);
  };

  const handleVisitorSignOut = () => {
    setVisitorData(null);
    setInductionDone(false);
    localStorage.removeItem(VISITOR_ID_KEY);
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

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;