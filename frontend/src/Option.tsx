import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect } from "react";

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
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(roleSchema), // Use Zod for validation
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      role: undefined, // Explicit default value
    },
  });

  const { user, ready } = usePrivy();
  const selectedRole = watch("role");
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      navigate("/", { replace: true });
    } else if (user && user.customMetadata?.role) {
      const role = user.customMetadata.role;
      navigate(`/${role}`, { replace: true });
    }
  }, [ready, user, navigate]);

  // Memoize the submit handler to prevent unnecessary re-renders
  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!user || !ready) {
        setError("root", {
          type: "manual",
          message: "User authentication not ready",
        });
        return;
      }

      try {
        await axios.post("http://localhost:8000/set-user-metadata", {
          user_id: user.id,
          custom_metadata: {
            role: data.role,
          },
        });

        // react router dom reload
        // navigate(location.pathname, { replace: true });

        window.location.reload();
      } catch (err) {
        console.error("Error updating user role:", err);
        setError("root", {
          type: "manual",
          message: "Failed to update user role. Please try again.",
        });
      }
    },
    [user, ready, navigate, setError]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center flex-col justify-center p-5">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Choose Your Role
        </h1>
        <p className="text-gray-600 mb-3 text-base text-center">
          Hi There! Registering for the first time? Please select whether you
          are a Job Seeker or an Employer to continue.
        </p>
      </div>
      <div className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-10">
          <Controller
            name="role"
            control={control}
            render={({ field, fieldState }) => (
              <div className="mb-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Candidate Card */}
                  <div
                    className={`relative cursor-pointer rounded-2xl border-4 p-8 transition-all duration-300 transform ${
                      field.value === "candidate"
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-2xl shadow-blue-500/30 scale-105"
                        : "border-gray-200 bg-white shadow-lg"
                    }`}
                    onClick={() => field.onChange("candidate")}
                  >
                    <div className="flex flex-col items-center text-center gap-4">
                      <div
                        className={`rounded-full p-4 transition-all duration-300 ${
                          field.value === "candidate"
                            ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/40"
                            : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500"
                        }`}
                      >
                        <svg
                          width="32"
                          height="32"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-2xl text-gray-800 mb-2">
                          Job Seeker
                        </h3>
                        <p className="text-gray-600 mb-3 text-base">
                          Find your dream job and advance your career
                        </p>
                        <div className="flex justify-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                      {field.value === "candidate" && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="white"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Card */}
                  <div
                    className={`relative cursor-pointer rounded-2xl border-4 p-8 transition-all duration-300 transform ${
                      field.value === "company"
                        ? "border-pink-500 bg-gradient-to-br from-pink-50 to-pink-100 shadow-2xl shadow-pink-500/30 scale-105"
                        : "border-gray-200 bg-white shadow-lg"
                    }`}
                    onClick={() => field.onChange("company")}
                  >
                    <div className="flex flex-col items-center text-center gap-4">
                      <div
                        className={`rounded-full p-4 transition-all duration-300 ${
                          field.value === "company"
                            ? "bg-gradient-to-br from-pink-500 to-pink-700 text-white shadow-lg shadow-pink-500/40"
                            : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500"
                        }`}
                      >
                        <svg
                          width="32"
                          height="32"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-2xl text-gray-800 mb-2">
                          Employer
                        </h3>
                        <p className="text-gray-600 mb-3 text-base">
                          Hire top talent and grow your business
                        </p>
                        <div className="flex justify-center gap-1">
                          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        </div>
                      </div>
                      {field.value === "company" && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="white"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error Display - Now uses fieldState for better error handling */}
                {fieldState.error && (
                  <p className="text-red-500 text-sm font-medium mt-2">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Root Error Display */}
          {errors.root && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">
                {errors.root.message}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedRole || isSubmitting}
            className={`w-full p-4 rounded-xl border-none text-white font-bold text-lg transition-all duration-300 transform ${
              selectedRole === "candidate"
                ? "bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg cursor-pointer hover:shadow-xl hover:scale-105"
                : selectedRole === "company"
                ? "bg-gradient-to-r from-pink-500 to-pink-700 shadow-lg cursor-pointer hover:shadow-xl hover:scale-105"
                : "bg-gradient-to-r from-gray-400 to-gray-600 opacity-60 scale-98 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Continue as{" "}
                  {selectedRole === "candidate"
                    ? "Job Seeker"
                    : selectedRole === "company"
                    ? "Employer"
                    : "..."}
                </>
              )}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
