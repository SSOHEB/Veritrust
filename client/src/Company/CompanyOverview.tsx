import type { Application } from "@/types";
import {
  Briefcase,
  Users,
  Clock,
  Eye,
  UserCheck,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { useGlobalContext } from "@/Context/useGlobalContext";
import { useState } from "react";

export const CompanyOverview: React.FC = () => {
  const { user, companyJobs, companyApplications, verifyCompany, organization } = useGlobalContext();
  const [verifying, setVerifying] = useState(false);

  // const companyUser = user as Company; 

  // In a real app, we'd enable the guard or check type here.

  const safeJobs = companyJobs || [];
  const safeApps = companyApplications || [];

  const handleVerify = async () => {
    setVerifying(true);
    await verifyCompany();
    setVerifying(false); // actually verifyCompany updates Firestore, which updates 'user' via listener
  };

  const getSubmissionStatusLabel = (status: Application["status"]) => {
    // ... logic same as before or simplified
    if (status === 'accepted') return "Verified";
    if (status === 'rejected') return "Needs Attention";
    return "Under Review";
  };

  const pendingApplications = safeApps.filter(
    (app) => app.status === "pending"
  );
  const acceptedApplications = safeApps.filter(
    (app) => app.status === "accepted" // Strict check "Verified"
  );

  const stats = [
    {
      label: "Active Jobs",
      value: safeJobs.filter((job) => job.status === "active").length,
      icon: Briefcase,
      color: "bg-blue-500",
      trend: "--", // trend logic requires history, leaving placeholder
    },
    {
      label: "Total Submissions",
      value: safeApps.length,
      icon: Users,
      color: "bg-green-500",
      trend: "--",
    },
    {
      label: "Under Review",
      value: pendingApplications.length,
      icon: Clock,
      color: "bg-yellow-500",
      trend: "--",
    },
    {
      label: "Verified",
      value: acceptedApplications.length,
      icon: UserCheck,
      color: "bg-purple-500",
      trend: "--",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-6 bg-gradient-to-r from-blue-50 via-white to-amber-50 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              Welcome back, {organization?.companyName || user?.name || "Company"}
              {organization?.verification?.zkVerified && (
                <ShieldCheck className="w-6 h-6 text-blue-600" aria-label="Verified Company" />
              )}
            </h1>
            <p className="text-slate-600 mt-1">
              Here's what's happening in your review queue today.
            </p>
          </div>

          <div>
            {organization?.verification?.zkVerified ? (
              <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
                <ShieldCheck className="w-5 h-5" />
                <span>Verified Company</span>
              </div>
            ) : (
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="flex items-center space-x-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors font-medium disabled:opacity-50"
              >
                {verifying ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    <span>Verify Company</span>
                  </>
                )}
              </button>
            )}
          </div>
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
                {/* Trend removed as we don't have historical data store yet */}
                <span className="text-slate-500">Real-time stats</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {safeJobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-500">
                    {job.location} • {job.type}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${job.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {job.status}
                </span>
              </div>
            ))}
            {safeJobs.length === 0 && <p className="text-sm text-gray-500">No active jobs found.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Submissions
            </h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {safeApps.slice(0, 3).map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl"
              >
                <div>
                  <h4 className="font-medium text-gray-900">
                    {application.candidate.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {application.job.title}
                  </p>
                </div>
                <div className="text-right">
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
                    {getSubmissionStatusLabel(application.status)}
                  </span>
                </div>
              </div>
            ))}
            {safeApps.length === 0 && <p className="text-sm text-gray-500">No submissions yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
