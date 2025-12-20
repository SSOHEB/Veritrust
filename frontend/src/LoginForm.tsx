import React, { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";

export const LoginForm: React.FC = () => {
  const { login: privyLogin, logout, user, ready } = usePrivy();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePrivyLogin = async () => {
    setLoading(true);
    try {
      await privyLogin();
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready) {
      if (user) {
        if (!user.customMetadata || user.customMetadata.role === undefined) {
          navigate("/option");
        }
        if (user.customMetadata && user.customMetadata.role === "candidate") {
          navigate("/candidate");
        }
        if (user.customMetadata && user.customMetadata.role === "company") {
          navigate("/company");
        }
      }
    }
  }, [user, ready]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">JobAI Platform</h1>
          <p className="text-gray-600 mt-2">
            AI-powered job matching for the future
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 flex justify-center space-y-3 flex-col">
          {/* <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setUserType("candidate")}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md transition-all ${
                userType === "candidate"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType("company")}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md transition-all ${
                userType === "company"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">Company</span>
            </button>
          </div> */}

          <div className="space-y-6">
            <button
              onClick={handlePrivyLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in with Privy"}
            </button>
          </div>
          <div className="space-y-6">
            <button
              onClick={logout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {"Sign Out"}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Secure authentication powered by Privy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
