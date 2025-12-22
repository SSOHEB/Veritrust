import type { Application } from "../types";
import {
  Clock,
  CheckCircle,
  FileText,
  Building2,
  MapPin,
  DollarSign,
} from "lucide-react";
import { useGlobalContext } from "@/Context/useGlobalContext";

export const ApplicationStatus: React.FC = () => {
  // Keep in sync with Application["status"] in types/index.ts
  type StatusKey = "pending" | "reviewed" | "accepted" | "rejected";

  const statusConfig: Record<
    StatusKey,
    {
      icon: React.FC<any>;
      color: string;
      label: string;
      description: string;
    }
  > = {
    pending: {
      icon: Clock,
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Under Review",
      description: "Your profile submission is under review",
    },
    reviewed: {
      icon: CheckCircle,
      color: "bg-blue-100 text-blue-800 border-blue-200",
      label: "Under Review",
      description: "Your profile submission is being reviewed by the company",
    },
    accepted: {
      icon: FileText,
      color: "bg-green-100 text-green-800 border-green-200",
      label: "Verified",
      description: "Your application has been accepted!",
    },
    rejected: {
      icon: Clock,
      color: "bg-red-100 text-red-800 border-red-200",
      label: "Needs Attention",
      description:
        "Your application was not selected for this role.",
    },
  };

  const getStatusSteps = (currentStatus: StatusKey) => {
    const steps: StatusKey[] = ["pending", "reviewed", "accepted"];

    if (currentStatus === "rejected") {
      return ["pending", "rejected"] as StatusKey[];
    }

    const currentIndex = steps.indexOf(currentStatus);
    return steps.slice(0, currentIndex + 1);
  };

  const { myApplication } = useGlobalContext();

  // Helper to ensure job exists (in case of stale application pointers)
  const validApplications = (myApplication || []).filter(app => app.job);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
        <p className="text-gray-600 mt-1">
          Track the status of your profile submissions
        </p>
      </div>

      {validApplications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No profile submissions yet
          </h3>
          <p className="text-gray-600 mb-4">
            Browse jobs and submit your profile to positions that match your
            skills
          </p>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          // Note: Navigation would be handled by parent or Link component usually. 
          // Since this is a view component, we assume user knows to click "Find Jobs".
          // Alternatively, could use navigate() if we import it.
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {validApplications.map((application: Application) => {
            // Default to pending if status is unknown/invalid
            const statusKey = (statusConfig[application.status as StatusKey] ? application.status : "pending") as StatusKey;
            const statusInfo = statusConfig[statusKey];
            const StatusIcon = statusInfo.icon;
            const statusSteps = getStatusSteps(statusKey);

            return (
              <div
                key={application.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {application.job?.title || "Unknown Position"}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {application.job?.company?.companyName || "Unknown Company"}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{application.job?.location || "Remote"}</span>
                          </div>
                          {application.job?.salary && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>
                                ${application.job.salary.min.toLocaleString()} -
                                ${application.job.salary.max.toLocaleString()}
                              </span>
                            </div>
                          )}
                          <span>
                            Submitted{" "}
                            {new Date(
                              application.appliedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}
                      >
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Submission Progress
                    </h4>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                      <span>View Details</span>
                    </button>
                  </div>

                  <div className="relative">
                    <div className="flex justify-between">
                      {(statusKey === "rejected"
                        ? (["pending", "rejected"] as StatusKey[])
                        : (["pending", "reviewed", "accepted"] as StatusKey[])
                      ).map((step, index, stepsArr) => {
                        const isCompleted = statusSteps.includes(step);
                        const isCurrent = statusKey === step;
                        const stepConfig = statusConfig[step as StatusKey];
                        const StepIcon = stepConfig.icon;

                        return (
                          <div
                            key={step}
                            className="flex flex-col items-center relative"
                          >
                            <div
                              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${isCompleted
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : isCurrent
                                    ? "bg-blue-100 border-blue-600 text-blue-600"
                                    : "bg-gray-100 border-gray-300 text-gray-400"
                                }`}
                            >
                              <StepIcon className="w-5 h-5" />
                            </div>
                            <span
                              className={`text-xs mt-2 text-center max-w-20 ${isCompleted || isCurrent
                                  ? "text-gray-900 font-medium"
                                  : "text-gray-500"
                                }`}
                            >
                              {stepConfig.label.replace(" ", "\n")}
                            </span>

                            {index < stepsArr.length - 1 && (
                              <div
                                className={`absolute top-5 left-12 w-36 h-0.5 ${isCompleted ? "bg-blue-600" : "bg-gray-300"
                                  }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      {statusInfo.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
