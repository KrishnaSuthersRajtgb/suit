import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import EHSLoginPage from "./page/Ehsloginpage";
import Dashboard from "./component/Dashboard";
import VisitorDashboard from "./page/Visitordashboard";
import SafetyAssessment from "./page/Safetyassessment";
import VisitorPass from "./page/Visitorpass";
import { useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn]       = useState(false);
  const [visitorData, setVisitorData]     = useState(null);
  const [inductionDone, setInductionDone] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Login — always accessible */}
        <Route
          path="/"
          element={
            <EHSLoginPage
              onLoginSuccess={() => setIsLoggedIn(true)}
              onVisitorCheckin={(data) => setVisitorData(data)}
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
                  onSignOut={() => { setVisitorData(null); setInductionDone(false); }}
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