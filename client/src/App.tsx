import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginForm } from "./LoginForm";
import { GlobalContextProvider } from "./Context/GlobalContext";
import Loading from "./components/Loading";
import { useGlobalContext } from "./Context/useGlobalContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
// Features disabled (routes + navigation) — keep files, but do not expose in UI.
import MainLayout from "./components/Layout/MainLayout";
import { JobSearch } from "./Candidate/JobSearch";
import { Profile } from "./Candidate/Profile";
import { ApplicationStatusComp } from "./Candidate/ApplicationStatus";
import { CandidateOverview } from "./Candidate/CandidateOverview";
import { ApplicationTracking } from "./Company/ApplicationTracking";
import CompanyInfo from "./Company/CompanyInfo";
import { CompanyOverview } from "./Company/CompanyOverview";
import { JobManagement } from "./Company/JobManagement";
// Replace this with any of the networks listed at https://github.com/wevm/viem/blob/main/src/chains/index.ts
import Option from "./Option";
import CommonDashboard from "./Shared/CommonDashboard";

const AppContent: React.FC = () => {
  const { loading } = useGlobalContext();

  // Don't block rendering the router on auth readiness; protected routes already gate on access.
  if (loading) {
    return <Loading message="Loading..." />;
  }

  return (
    <Routes>
      {/* Candidate routes */}
      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedType="candidate">
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CandidateOverview />} />
        <Route path="jobs" element={<JobSearch />} />
        <Route path="profile" element={<Profile />} />
        <Route path="applications" element={<ApplicationStatusComp />} />
        <Route path="commondashboard" element={<CommonDashboard />} />
      </Route>

      {/* Company routes */}
      <Route path="/company" element={<MainLayout />}>
        <Route path="applications" element={<ApplicationTracking />} />
        <Route path="profile" element={<CompanyInfo />} />
        <Route index element={<CompanyOverview />} />
        <Route path="jobs" element={<JobManagement />} />
        <Route path="commondashboard" element={<CommonDashboard />} />
      </Route>
      <Route path="/option" element={<Option />} />
      <Route path="/" element={<LoginForm />} />

      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <GlobalContextProvider>
        <AppContent />
      </GlobalContextProvider>
    </BrowserRouter>
  );
}

export default App;
