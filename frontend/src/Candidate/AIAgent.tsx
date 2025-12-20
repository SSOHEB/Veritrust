import React, { useState, useEffect } from "react";
import type { Candidate } from "@/types/index";
import {
  Bot,
  Play,
  Star,
  CheckCircle,
  Clock,
  Loader,
  Calendar,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useGlobalContext } from "@/Context/useGlobalContext";
import { contractAbi } from "@/lib/contractAbi";
import type { Hex } from "viem";

/**
 * AIAgent Component - Integrated with Backend Job Search Streaming
 *
 * This component connects to the Python FastAPI backend to perform real-time
 * job searching using AI-powered matching. It uses Server-Sent Events (SSE)
 * to stream progress updates to the user.
 *
 * Backend Integration:
 * - Health check: GET /
 * - Streaming endpoint: GET /search-jobs/{candidate_id}/stream
 * - Compatibility threshold parameter: 0.0 - 1.0
 *
 * Features:
 * - Real-time progress streaming
 * - Backend health monitoring
 * - User authentication integration
 * - Configurable compatibility scoring
 *
 * Environment Configuration:
 * - VITE_API_URL: Backend API base URL (default: http://localhost:8000)
 */

interface SSEEvent {
  step: string;
  current_step?: string;
  message: string;
  matched_count?: number;
}

// Configuration for the streaming endpoint
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const AIAgent: React.FC = () => {
  const [minCompatibilityScore, setMinCompatibilityScore] = useState(75);
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const { user } = usePrivy();
  const { jobPublicClient, jobWalletClient, myApplication, contractAddress } =
    useGlobalContext();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const aiApplications =
    myApplication?.filter(
      (app) => app.candidateId === candidate?.candidateId && app.aiApplied
    ) || [];

  // Check backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        setIsBackendOnline(response.ok);
      } catch (error) {
        console.error("Backend health check failed:", error);
        setIsBackendOnline(false);
      }
    };

    checkBackendHealth();
  }, []);

  const startRealSSEStream = async () => {
    if (!candidate?.candidateId) {
      console.error("No candidate ID available");
      return;
    }

    setIsRunning(true);
    setEvents([]);

    try {
      const eventSource = new EventSource(
        `${API_BASE_URL}/search-jobs/${
          candidate.candidateId
        }/stream?compatibility_threshold=${minCompatibilityScore / 100}`
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SSEEvent;
          console.log("Received SSE event:", data);

          setEvents((prev) => [...prev, data]);

          // Handle completion
          if (data.step === "completed") {
            setTimeout(() => {
              eventSource.close();
              setIsRunning(false);
            }, 1000);
          }

          // Handle errors
          if (data.step === "error") {
            console.error("SSE Error:", data.message);
            eventSource.close();
            setIsRunning(false);
          }
        } catch (parseError) {
          console.error("Error parsing SSE data:", parseError);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        setEvents((prev) => [
          ...prev,
          {
            step: "error",
            message:
              "Connection lost. Please check your internet connection and try again.",
          },
        ]);
        eventSource.close();
        setIsRunning(false);
      };

      eventSource.onopen = () => {
        console.log("SSE connection opened");
        setEvents([
          {
            step: "connected",
            message: "Connected to AI job search service",
          },
        ]);
      };
    } catch (error) {
      console.error("Error starting SSE stream:", error);
      setIsRunning(false);
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case "started":
      case "connected":
        return <Play className="w-4 h-4 text-blue-500" />;
      case "load_profile":
      case "profile_loaded":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "fetch_jobs":
      case "jobs_fetched":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "match_jobs":
      case "jobs_matched":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "generate_applications":
      case "applications_generated":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <div className="w-4 h-4 rounded-full bg-red-500"></div>;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  useEffect(() => {
    if (!jobPublicClient || !jobWalletClient) return;
    if (!user) return;
    const fetchCandidate = async () => {
      try {
        const profile = await jobPublicClient.readContract({
          functionName: "getCandidate",
          address: contractAddress as Hex,
          abi: contractAbi,
          args: [user?.google?.email || ""],
        });
        console.log(profile, "profile");
        setCandidate(profile);
      } catch (error) {
        console.error("Error fetching candidate profile:", error);
        setCandidate(null);
      }
    };

    fetchCandidate();
  }, [user, jobPublicClient, jobWalletClient, contractAddress]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Job Agent</h1>
          <p className="text-gray-600 mt-1">
            Let AI automatically apply to relevant jobs based on your
            compatibility score
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Backend Status Indicator */}
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isBackendOnline === null
                ? "bg-yellow-100 text-yellow-800"
                : isBackendOnline
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                isBackendOnline === null
                  ? "bg-yellow-400"
                  : isBackendOnline
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            ></div>
            {isBackendOnline === null
              ? "Checking..."
              : isBackendOnline
              ? "API Online"
              : "API Offline"}
          </span>

          {/* Agent Status */}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isRunning
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                isRunning ? "bg-blue-500 animate-pulse" : "bg-gray-400"
              }`}
            ></div>
            {isRunning ? "Running" : "Ready"}
          </span>
        </div>
      </div>

      {/* AI Applications Stats */}
      {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <Bot className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            AI Application Statistics
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {aiApplications.length}
            </div>
            <div className="text-sm font-medium text-purple-800">
              Total AI Applications
            </div>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {
                aiApplications.filter(
                  (app) => app.status !== "pending" && app.status !== "rejected"
                ).length
              }
            </div>
            <div className="text-sm font-medium text-blue-800">
              Successful Applications
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {aiApplications.length > 0
                ? Math.round(
                    (aiApplications.filter((app) => app.status !== "rejected")
                      .length /
                      aiApplications.length) *
                      100
                  )
                : 0}
              %
            </div>
            <div className="text-sm font-medium text-green-800">
              Success Rate
            </div>
          </div>
        </div>
      </div> */}

      {/* Agent Configuration */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <Star className="w-6 h-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Agent Configuration
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Compatibility Score
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="50"
                max="95"
                value={minCompatibilityScore}
                onChange={(e) =>
                  setMinCompatibilityScore(parseInt(e.target.value))
                }
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-900 w-12">
                {minCompatibilityScore}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Only apply to jobs with compatibility score above this threshold
            </p>
            {!candidate?.candidateId && (
              <p className="text-xs text-red-500 mt-2">
                ⚠️ Please log in to use the AI job search agent
              </p>
            )}
            {candidate?.candidateId && !isBackendOnline && (
              <p className="text-xs text-red-500 mt-2">
                ⚠️ Backend service is offline. Please try again later.
              </p>
            )}
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={startRealSSEStream}
              disabled={
                isRunning || !candidate?.candidateId || !isBackendOnline
              }
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center space-x-2"
            >
              {isRunning ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Analyzing Jobs...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Start Job Search</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SSE Event Stream */}
      {(events.length > 0 || isRunning) && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <Loader
              className={`w-6 h-6 ${
                isRunning ? "animate-spin text-blue-600" : "text-gray-400"
              }`}
            />
            <h3 className="text-lg font-semibold text-gray-900">
              Agent Activity Stream
            </h3>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
            {events.map((event, index) => (
              <div key={index} className="flex items-start space-x-3 mb-2">
                {getStepIcon(event.current_step || event.step)}
                <div className="flex-1">
                  <div
                    className={`${
                      event.step === "error"
                        ? "text-red-400"
                        : event.step === "completed"
                        ? "text-green-400"
                        : "text-green-400"
                    }`}
                  >
                    {event.step === "error" && event.message !== "" ? (
                      <div>
                        <div>❌ Error: {event.message}</div>
                      </div>
                    ) : event.step === "completed" ? (
                      <div>
                        <div>✅ {event.message}</div>
                        {event.matched_count && (
                          <div className="text-blue-400 mt-1">
                            → Found {event.matched_count} matching jobs
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        data:{" "}
                        {JSON.stringify({
                          step: event.step,
                          message: event.message,
                          ...(event.matched_count && {
                            matched_count: event.matched_count,
                          }),
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isRunning && (
              <div className="flex items-center space-x-2 text-yellow-400">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Processing job search...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Applications List */}
      {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          AI Applied Jobs
        </h3>

        {aiApplications.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No AI applications yet</p>
            <p className="text-sm text-gray-400">
              Start your AI agent to begin auto-applying
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {aiApplications.map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200"
              >
                <div className="flex items-center space-x-3">
                  <Bot className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {application.job.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {application.job.company?.companyName ||
                        "Unknown Company"}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Applied:{" "}
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {application.compatibilityScore}%
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      application.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : application.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : application.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {application.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div> */}
    </div>
  );
};
