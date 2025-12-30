import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { auth } from "./lib/firebase";
import { updateUserRole } from "./lib/db";

// Validation schema for better type safety and validation
const roleSchema = z.object({
  role: z.enum(["candidate", "company"], {
    required_error: "Please select your role",
  }),
});

type FormData = z.infer<typeof roleSchema>;

export default function Option() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(roleSchema), // Use Zod for validation
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      role: undefined, // Explicit default value
    },
  });

  const selectedRole = watch("role");
  const navigate = useNavigate();

  // Memoize the submit handler to prevent unnecessary re-renders
  const onSubmit = useCallback(
    async (data: FormData) => {
      const uid = auth.currentUser?.uid;
      if (uid) {
        await updateUserRole(uid, data.role === "candidate" ? "student" : "recruiter");
      }

      localStorage.setItem("role", data.role);
      navigate(`/${data.role}`);
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center flex-col justify-center p-5 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-900/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-white to-amber-200 mb-4 tracking-tight">
            Identify Your Role
          </h1>
          <p className="text-neutral-400 text-lg max-w-lg mx-auto leading-relaxed">
            Select your path to access the decentralized verification network.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="role"
            control={control}
            render={({ field, fieldState }) => (
              <div className="mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Candidate Card - Violet Theme */}
                  <div
                    className={`group relative cursor-pointer rounded-3xl p-8 transition-all duration-500 transform ${field.value === "candidate"
                        ? "bg-neutral-900 border-2 border-violet-500/50 shadow-2xl shadow-violet-500/20 scale-[1.02]"
                        : "bg-neutral-900/50 border border-neutral-800 hover:bg-neutral-800 hover:border-violet-500/30"
                      } backdrop-blur-xl`}
                    onClick={() => field.onChange("candidate")}
                  >
                    <div className="flex flex-col items-center text-center gap-6">
                      <div
                        className={`rounded-2xl p-5 transition-all duration-500 ${field.value === "candidate"
                            ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg"
                            : "bg-neutral-800 text-violet-400 group-hover:scale-110"
                          }`}
                      >
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className={`font-bold text-2xl mb-2 transition-colors ${field.value === 'candidate' ? 'text-white' : 'text-neutral-200 group-hover:text-white'}`}>
                          Student / Candidate
                        </h3>
                        <p className="text-neutral-400 text-sm leading-relaxed group-hover:text-neutral-300 transition-colors">
                          Build your on-chain verified CV. <br />Apply to jobs with zero-knowledge proof credentials.
                        </p>
                      </div>
                      <div className="flex justify-center gap-2 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500/30"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500/10"></span>
                      </div>
                      {field.value === "candidate" && (
                        <div className="absolute top-4 right-4 w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center animate-pulse">
                          <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Card - Amber Theme */}
                  <div
                    className={`group relative cursor-pointer rounded-3xl p-8 transition-all duration-500 transform ${field.value === "company"
                        ? "bg-neutral-900 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20 scale-[1.02]"
                        : "bg-neutral-900/50 border border-neutral-800 hover:bg-neutral-800 hover:border-amber-500/30"
                      } backdrop-blur-xl`}
                    onClick={() => field.onChange("company")}
                  >
                    <div className="flex flex-col items-center text-center gap-6">
                      <div
                        className={`rounded-2xl p-5 transition-all duration-500 ${field.value === "company"
                            ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg"
                            : "bg-neutral-800 text-amber-400 group-hover:scale-110"
                          }`}
                      >
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className={`font-bold text-2xl mb-2 transition-colors ${field.value === 'company' ? 'text-white' : 'text-neutral-200 group-hover:text-white'}`}>
                          Recruiter / Company
                        </h3>
                        <p className="text-neutral-400 text-sm leading-relaxed group-hover:text-neutral-300 transition-colors">
                          Verify entity reputation on-chain. <br />Hire verified talent instantly.
                        </p>
                      </div>
                      <div className="flex justify-center gap-2 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/30"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/10"></span>
                      </div>
                      {field.value === "company" && (
                        <div className="absolute top-4 right-4 w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center animate-pulse">
                          <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {fieldState.error && (
                  <div className="flex justify-center mt-6 animate-fade-in-up">
                    <p className="text-rose-400 bg-rose-500/10 px-4 py-2 rounded-lg text-sm font-medium border border-rose-500/20">
                      ⚠️ {fieldState.error.message}
                    </p>
                  </div>
                )}
              </div>
            )}
          />

          {/* Submit Button */}
          <div className="max-w-md mx-auto">
            <button
              type="submit"
              disabled={!selectedRole || isSubmitting}
              className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 transform border border-transparent ${selectedRole === "candidate"
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02]"
                  : selectedRole === "company"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02]"
                    : "bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed opacity-50"
                }`}
            >
              <div className="flex items-center justify-center gap-3">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Initializing Dashboard...</span>
                  </>
                ) : (
                  <>
                    <span>Continue as {selectedRole === 'candidate' ? 'Student' : selectedRole === 'company' ? 'Recruiter' : '...'}</span>
                    {selectedRole && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
                  </>
                )}
              </div>
            </button>
            <p className="text-center text-neutral-500 text-xs mt-6">
              VeriTrust is currently running on Flow EVM Testnet (Chain ID 545).
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
