import React from "react";
import type { Candidate, Application, Job, Company } from "../types";
import { FileText, TrendingUp, Eye, CheckCircle, Clock } from "lucide-react";

import { useGlobalContext } from "@/Context/useGlobalContext";

export const CandidateOverview: React.FC = () => {
  const { user, myApplication, allJobs } = useGlobalContext();

  // Safe cast or check
  const candidate = user?.type === 'candidate' ? (user as Candidate) : null;

  const candidateApplications = myApplication || [];

  const pendingApplications = candidateApplications.filter(
    (app: Application) => app.status === "pending"
  );
  const acceptedApplications = candidateApplications.filter(
    (app: Application) => app.status !== "pending" && app.status !== "rejected"
  );

  const stats = [
    {
      label: "Profile Submissions",
      value: candidateApplications.length,
      icon: FileText,
      color: "bg-blue-500",
      trend: "+0 this week", // dynamic calculation complex, static for now or calculate if date available
    },
    {
      label: "Under Review",
      value: pendingApplications.length,
      icon: Clock,
      color: "bg-yellow-500",
      trend: "Updates pending",
    },
    {
      label: "Verified",
      value: acceptedApplications.length,
      icon: CheckCircle,
      color: "bg-green-500",
      trend: "Credentials verified",
    },
  ];

  const recentJobs = (allJobs || []).slice(0, 4);

  const getStatusLabel = (status: Application["status"]) => {
    switch (status) {
      case "pending":
      case "reviewed":
        return "Under Review";
      case "accepted":
        return "Verified";
      case "rejected":
        return "Needs Attention";
      default:
        return status;
    }
  };

  if (!candidate) {
    return <div className="p-6">Please log in as a candidate.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-6 bg-gradient-to-r from-blue-50 via-white to-emerald-50">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Welcome back, {candidate.name}
          </h1>
          <p className="text-slate-600 mt-1">
            Track your profile submissions and browse new jobs.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-semibold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center shadow-sm`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
                <span className="text-emerald-700 font-medium truncate">{stat.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Submissions
            </h3>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {candidateApplications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No profile submissions yet</p>
                <p className="text-sm text-gray-400">
                  Submit your profile to jobs to see updates here
                </p>
              </div>
            ) : (
              candidateApplications
                .slice(0, 3)
                .map((application: Application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {application.job.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {application.job.company?.companyName ?? ""}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${application.status === "pending"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : application.status === "reviewed"
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : application.status === "accepted"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-red-50 text-red-800 border-red-200"
                            }`}
                        >
                          {getStatusLabel(application.status)}
                        </span>
                        {/* Extra badges disabled */}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Recommendations + match scores disabled */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentJobs.map((job: Job) => (
              <div key={job.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <h4 className="font-medium text-gray-900">{job.title}</h4>
                <p className="text-sm text-gray-600">{job.company?.companyName ?? ""}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {job.location} • {job.type}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status section disabled */}
    </div>
  );
};
