import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginForm } from "./LoginForm";
import { GlobalContextProvider } from "./Context/GlobalContext";
import Loading from "./components/Loading";
import { useGlobalContext } from "./Context/useGlobalContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AIAgent } from "./Candidate/AIAgent";
import MainLayout from "./components/Layout/MainLayout";
import { JobSearch } from "./Candidate/JobSearch";
import { Profile } from "./Candidate/Profile";
import { ApplicationStatus } from "./Candidate/ApplicationStatus";
import { CandidateOverview } from "./Candidate/CandidateOverview";
import { AISearch } from "./Company/AISearch";
import { ApplicationTracking } from "./Company/ApplicationTracking";
import CompanyInfo from "./Company/CompanyInfo";
import { CompanyOverview } from "./Company/CompanyOverview";
import { JobManagement } from "./Company/JobManagement";
// Replace this with any of the networks listed at https://github.com/wevm/viem/blob/main/src/chains/index.ts
import { flowTestnet } from "viem/chains";
import { PrivyProvider } from "@privy-io/react-auth";
import Option from "./Option";
import CommonDashboard from "./Shared/CommonDashboard";

const AppContent: React.FC = () => {
  const { loading } = useGlobalContext();

  // Don't block rendering the router on Privy readiness; protected routes already gate on auth.
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
        <Route path="ai-agent" element={<AIAgent />} />
        <Route path="profile" element={<Profile />} />
        <Route path="applications" element={<ApplicationStatus />} />
        <Route path="commondashboard" element={<CommonDashboard />} />
      </Route>

      {/* Company routes */}
      <Route path="/company" element={<MainLayout />}>
        <Route path="ai-search" element={<AISearch />} />
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
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;
  const privyClientId = import.meta.env.VITE_PRIVY_CLIENT_ID;

  if (!privyAppId || !privyClientId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-gray-200 rounded-xl p-6">
          <h1 className="text-xl font-semibold text-gray-900">Missing Privy configuration</h1>
          <p className="text-gray-600 mt-2">
            Create <code className="px-1 py-0.5 bg-gray-100 rounded">frontend/.env</code> and set:
          </p>
          <pre className="mt-3 p-3 bg-gray-900 text-gray-100 rounded text-sm overflow-auto">VITE_PRIVY_APP_ID=...\nVITE_PRIVY_CLIENT_ID=...\nVITE_API_URL=http://localhost:8000</pre>
          <p className="text-gray-600 mt-3">Then restart the dev server.</p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      clientId={privyClientId}
      config={{
        // Create embedded wallets for users who don't have a wallet
        appearance: {
          walletChainType: "ethereum-only",
        },

        supportedChains: [flowTestnet],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
          showWalletUIs: true,
        },
      }}
    >
      <BrowserRouter>
        <GlobalContextProvider>
          <AppContent />
        </GlobalContextProvider>
      </BrowserRouter>
    </PrivyProvider>
  );
}

export default App;
