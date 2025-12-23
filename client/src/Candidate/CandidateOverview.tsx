import React from "react";
import type { Candidate, Application, Job } from "../types";
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl border border-teal-100 shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="px-8 py-10 bg-gradient-to-r from-teal-50 via-white to-emerald-50 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="p-1.5 bg-white rounded-full shadow-sm">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-serif text-2xl shadow-inner border-2 border-white">
                {(candidate.name || 'S').charAt(0)}
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-teal-950 tracking-tight">
                Welcome back, {candidate.name}
              </h1>
              <p className="text-teal-800/80 mt-2 font-medium flex items-center gap-2">
                <span className="px-2 py-0.5 bg-teal-100/50 rounded-md text-sm border border-teal-200/50">Student Console</span>
                <span className="text-teal-300">•</span>
                <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          // Custom colors and gradients for Student Theme
          const iconBg = stat.label === "Verified" ? "bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50" :
            stat.label === "Under Review" ? "bg-amber-100 text-amber-700 ring-4 ring-amber-50" :
              "bg-teal-100 text-teal-700 ring-4 ring-teal-50";

          return (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-white transition-colors">
                  <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                {stat.trend && (
                  <span className="text-[10px] font-bold uppercase tracking-wider py-1 px-2 bg-slate-50 text-slate-500 rounded-full border border-slate-100 group-hover:border-teal-100 group-hover:text-teal-600 transition-colors">
                    Trend
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans mb-1">
                  {stat.label}
                </p>
                <p className="text-4xl font-serif font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {stat.value}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-500 mr-1.5" />
                <span className="text-emerald-700 font-semibold truncate text-xs">{stat.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Submissions */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-2xl font-serif font-bold text-slate-900">
                Recent Submissions
              </h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">Track your application status</p>
            </div>
            <div className="p-2 bg-teal-50 rounded-xl">
              <Eye className="w-6 h-6 text-teal-600" />
            </div>
          </div>

          <div className="space-y-4">
            {candidateApplications.length === 0 ? (
              <div className="text-center py-16 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 group hover:border-teal-200 transition-colors">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-slate-300 group-hover:text-teal-400 transition-colors" />
                </div>
                <p className="text-slate-900 font-semibold text-lg">No submissions yet</p>
                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                  Start applying to verified jobs to see your tracking history here.
                </p>
              </div>
            ) : (
              candidateApplications
                .slice(0, 3)
                .map((application: Application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-xl hover:border-teal-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900 text-lg group-hover:text-teal-800 transition-colors font-serif">
                          {application.job.title}
                        </h4>
                        <span
                          className={`px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${application.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : application.status === "reviewed"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : application.status === "accepted"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                        >
                          {getStatusLabel(application.status)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="text-sm text-slate-600 font-medium">
                          {application.job.company?.companyName ?? ""}
                        </p>
                        {application.job.company?.verification?.status === "verified" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded text-[10px] font-bold text-emerald-700 uppercase tracking-wide border border-emerald-100">
                            <CheckCircle className="w-3 h-3" /> Industries Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-2xl font-serif font-bold text-slate-900">Recommended Jobs</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">Curated based on your profile</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="space-y-4">
            {recentJobs.map((job: Job) => (
              <div key={job.id} className="p-5 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 font-serif text-lg group-hover:text-indigo-700 transition-colors">
                      {job.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-slate-600 font-medium">{job.company?.companyName ?? ""}</p>
                      {job.company?.verification?.status === "verified" && (
                        <span className="text-emerald-500">
                          <CheckCircle className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase">
                      {job.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    Posted recently
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
