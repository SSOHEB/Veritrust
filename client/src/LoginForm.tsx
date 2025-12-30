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
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-violet-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-fuchsia-900/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-500/20 transform rotate-3 hover:rotate-6 transition-transform duration-500">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-sans font-bold text-white tracking-tight mb-2">VeriTrust</h1>
          <p className="text-neutral-400 text-lg font-light tracking-wide">
            The Standard for <span className="text-violet-400 font-medium">Verified</span> Hiring
          </p>
        </div>

        <div className="bg-neutral-900/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/5 p-8 flex flex-col justify-center space-y-6">
          <div className="text-center space-y-2 mb-2">
            <p className="text-neutral-300 text-sm leading-relaxed">
              Connect your professional identity to the blockchain. <br />
              Secure, Immutable, and Trusted.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleEnter}
              disabled={loading}
              className="group w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-violet-900/20 hover:shadow-violet-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <span>Establishing Connection...</span>
              ) : (
                <>
                  <span>Enter VeriTrust</span>
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </>
              )}
            </button>
          </div>

          <div className="pt-6 border-t border-white/5">
            <div className="flex justify-center items-center gap-2 text-xs text-neutral-500 font-mono uppercase tracking-widest">
              <span>Secured by</span>
              <span className="text-neutral-400 font-bold">Google Auth</span>
              <span>•</span>
              <span className="text-neutral-400 font-bold">Flow Blockchain</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <button
            onClick={handleSignOut}
            className="text-neutral-500 hover:text-neutral-300 text-sm transition-colors"
          >
            Sign out / Switch Account
          </button>
        </div>
      </div>
    </div>
  );
};
