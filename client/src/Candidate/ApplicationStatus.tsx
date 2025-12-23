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
      color: "bg-amber-50 text-amber-800 border-amber-200",
      label: "Pending Review",
      description: "Your profile submission has been received and is awaiting review.",
    },
    reviewed: {
      icon: CheckCircle,
      color: "bg-teal-50 text-teal-800 border-teal-200",
      label: "Under Review",
      description: "Your profile is currently being reviewed by the hiring team.",
    },
    accepted: {
      icon: FileText,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      label: "Verified Candidate",
      description: "Congratulations! Your application has been accepted and profile verified.",
    },
    rejected: {
      icon: Clock,
      color: "bg-rose-50 text-rose-800 border-rose-200",
      label: "Needs Attention",
      description:
        "Your application requires attention or was not selected for this role.",
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
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl border border-teal-100 shadow-md bg-gradient-to-r from-teal-50/80 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <h1 className="text-4xl font-serif font-bold text-teal-950 relative z-10">My Applications</h1>
        <p className="text-teal-800/80 mt-2 font-medium text-lg relative z-10">
          Track the real-time status of your verified profile submissions
        </p>
      </div>

      {validApplications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-teal-100 group hover:border-teal-200 transition-colors">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <FileText className="w-10 h-10 text-teal-600" />
          </div>
          <h3 className="text-xl font-serif font-bold text-teal-900 mb-2">
            No profile submissions yet
          </h3>
          <p className="text-slate-600 mb-8 max-w-sm mx-auto">
            Browse verified jobs and submit your student profile to positions that match your skills.
          </p>
          <button
            className="bg-teal-600 text-white px-8 py-3.5 rounded-xl hover:bg-teal-700 transition-all font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Find Opportunities
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {validApplications.map((application: Application) => {
            // Default to pending if status is unknown/invalid
            const statusKey = (statusConfig[application.status as StatusKey] ? application.status : "pending") as StatusKey;
            const statusInfo = statusConfig[statusKey];
            const StatusIcon = statusInfo.icon;
            const statusSteps = getStatusSteps(statusKey);

            return (
              <div
                key={application.id}
                className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start space-x-6">
                      <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:border-teal-100 group-hover:shadow-md transition-all">
                        <Building2 className="w-8 h-8 text-slate-400 group-hover:text-teal-500 transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-slate-900 mb-1 group-hover:text-teal-900 transition-colors">
                          {application.job?.title || "Unknown Position"}
                        </h3>
                        <p className="text-slate-600 mb-4 font-bold text-base flex items-center gap-2">
                          {application.job?.company?.companyName || "Unknown Company"}
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </p>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{application.job?.location || "Remote"}</span>
                          </div>
                          {application.job?.salary && (
                            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                              <DollarSign className="w-4 h-4 text-slate-400" />
                              <span>
                                ${application.job.salary.min.toLocaleString()} -
                                ${application.job.salary.max.toLocaleString()}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>
                              Submitted{" "}
                              {new Date(
                                application.appliedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border uppercase tracking-wide shadow-sm ${statusInfo.color}`}
                      >
                        <StatusIcon className="w-5 h-5 mr-2" />
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="p-8">
                  <div className="flex items-center justify-between mb-10">
                    <h4 className="text-xl font-serif font-bold text-slate-900">
                      Application Status
                    </h4>
                    <button className="text-teal-600 hover:text-teal-700 text-sm font-bold flex items-center space-x-1 hover:underline bg-teal-50 px-4 py-2 rounded-lg transition-colors">
                      <span>View Submission Details</span>
                    </button>
                  </div>

                  <div className="relative px-6 pb-4">
                    <div className="flex justify-between relative z-10">
                      {(statusKey === "rejected"
                        ? (["pending", "rejected"] as StatusKey[])
                        : (["pending", "reviewed", "accepted"] as StatusKey[])
                      ).map((step) => {
                        const isCompleted = statusSteps.includes(step);
                        const isCurrent = statusKey === step;
                        const stepConfig = statusConfig[step as StatusKey];
                        const StepIcon = stepConfig.icon;

                        return (
                          <div
                            key={step}
                            className="flex flex-col items-center relative group"
                          >
                            <div
                              className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 transform ${isCompleted
                                ? "bg-teal-600 border-teal-600 text-white shadow-lg scale-110"
                                : isCurrent
                                  ? "bg-white border-teal-600 text-teal-600 shadow-lg ring-4 ring-teal-50 scale-110"
                                  : "bg-white border-slate-200 text-slate-300"
                                }`}
                            >
                              <StepIcon className="w-6 h-6" />
                            </div>
                            <span
                              className={`text-sm mt-4 text-center font-bold tracking-tight ${isCompleted || isCurrent
                                ? "text-teal-900"
                                : "text-slate-400"
                                }`}
                            >
                              {stepConfig.label.replace(" ", "\n")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Progress Bar Background */}
                    <div className="absolute top-7 left-0 w-full h-1.5 bg-slate-100 -z-0 rounded-full mx-6" />

                    {/* Active Progress Bar */}
                    <div
                      className="absolute top-7 left-0 h-1.5 bg-gradient-to-r from-teal-400 to-emerald-500 -z-0 rounded-full mx-6 transition-all duration-700 ease-out"
                      style={{
                        width: statusKey === 'accepted' ? '100%' : statusKey === 'reviewed' ? '50%' : '0%'
                      }}
                    />
                  </div>

                  <div className="mt-12 p-6 bg-teal-50/50 rounded-2xl border border-teal-100 flex items-start gap-5">
                    <div className="p-3 bg-white rounded-xl border border-teal-100 shadow-sm shrink-0">
                      <StatusIcon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h5 className="font-bold text-teal-900 text-base mb-1">{statusInfo.label}</h5>
                      <p className="text-teal-800/80 leading-relaxed font-medium">
                        {statusInfo.description}
                      </p>
                    </div>
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
