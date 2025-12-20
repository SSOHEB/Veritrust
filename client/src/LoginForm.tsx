import React, { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { onAuthChange, signInWithGoogle, signOutUser } from "./lib/auth";

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        if (import.meta.env.DEV) {
          console.log("Firebase auth: signed in", {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          });
        }
        navigate("/option");
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleEnter = async () => {
    setLoading(true);
    try {
      const firebaseUser = await signInWithGoogle();
      if (import.meta.env.DEV) {
        console.log("Firebase auth: sign-in success", {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        });
      }
      navigate("/option");
    } catch (error) {
      console.error("Google Sign-in failed:", error);
      if (import.meta.env.DEV) {
        const message =
          typeof (error as any)?.message === "string"
            ? (error as any).message
            : "Google sign-in failed";
        // Temporary debug surface in dev mode only
        alert(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
      if (import.meta.env.DEV) {
        console.log("Firebase auth: signed out");
      }
      navigate("/");
    } catch (err) {
      console.error("Firebase auth: sign-out failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">VeriTrust</h1>
          <p className="text-gray-600 mt-2">
            Verified hiring for students and recruiters.
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
              onClick={handleEnter}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entering..." : "Enter VeriTrust"}
            </button>
          </div>
          <div className="space-y-6">
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {"Sign out"}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">Secure sign-in powered by Google</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
