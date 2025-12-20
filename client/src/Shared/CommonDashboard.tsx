import React, { useState, useMemo, useEffect } from "react";
import { Search, FileText, CheckCircle, X } from "lucide-react";
import type { Application, Application1 } from "../types";
import ApplicationCard from "./ApplicationCard";
import { useGlobalContext } from "@/Context/useGlobalContext";
import { useLocation } from "react-router-dom";

const CommonDashboard: React.FC = () => {
  const location = useLocation();
  const roleFromPath = location.pathname.startsWith("/candidate")
    ? "candidate"
    : location.pathname.startsWith("/company")
    ? "company"
    : null;
  const isCandidate = roleFromPath === "candidate";

  // === Shared applications state ===
  const [applications, setApplications] =
    useState<Application1[]>([]);

  const {
    jobWalletClient,
    jobPublicClient,
    companyApplications,
    updateApplicationStatus,
  } = useGlobalContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "status" | "company">("date");

  // === Update application status by company ===
  type ApplicationCardStatus =
    | "approved"
    | "rejected"
    | "reviewed"
    | "pending"
    | "pending for proof";

  const handleStatusChange = (id: string, status: ApplicationCardStatus) => {
    // Call context function to update status in backend/contract
    if (updateApplicationStatus && (status === "approved" || status === "rejected")) {
      updateApplicationStatus(id, status);
    }

    // Only persist statuses supported by Application1
    if (status !== "approved" && status !== "rejected" && status !== "pending") {
      return;
    }

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;

        if (status === "pending") {
          return {
            ...app,
            status: "pending",
            companyAction: null,
          };
        }

        // status is now "approved" | "rejected"
        return {
          ...app,
          status,
          companyAction: {
            status,
            actionDate: new Date().toISOString(),
          },
        };
      })
    );
  };

  // === Upload proof document by company ===
  const handleFileUpload = (id: string, file: File) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              companyAction: {
                ...(app.companyAction ?? {
                  status: "approved", // Ensure status is approved when uploading proof
                  actionDate: new Date().toISOString(),
                }),
                proofDocument: {
                  name: file.name,
                  url: URL.createObjectURL(file),
                  uploadDate: new Date().toISOString(),
                },
              },
              // Keep the main status as approved
              status: "approved",
            }
          : app
      )
    );
  };

  // === Candidate verifies the proof to finalize status ===
  const handleVerify = (id: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              status: "verified", // Change main status to verified
              candidateVerified: true,
              verificationDate: new Date().toISOString(),
            }
          : app
      )
    );
  };

  // === Filter and sort applications for display ===
  // NOTE: filteredApplications is currently unused (we render role-specific lists below).
  // const filteredApplications = useMemo(() => {
  //   return applications
  //     .filter((app) => {
  //       const matchesSearch =
  //         searchTerm === "" ||
  //         app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         app.candidateName.toLowerCase().includes(searchTerm.toLowerCase());

  //       const matchesStatus =
  //         statusFilter === "all" || app.status === statusFilter;

  //       return matchesSearch && matchesStatus;
  //     })
  //     .sort((a, b) => {
  //       switch (sortBy) {
  //         case "date":
  //           return (
  //             new Date(b.appliedDate).getTime() -
  //             new Date(a.appliedDate).getTime()
  //           );
  //         case "status":
  //           return a.status.localeCompare(b.status);
  //         case "company":
  //           return a.companyName.localeCompare(b.companyName);
  //         default:
  //           return 0;
  //       }
  //     });
  // }, [applications, searchTerm, statusFilter, sortBy]);

  // === Dashboard stats ===
  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((a) => a.status === "pending").length,
      approved: applications.filter((a) => a.status === "approved").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
      verified: applications.filter((a) => a.status === "verified").length,
    };
  }, [applications]);

  const [companyApplicationnn, setCompanyApplicationnn] =
    useState<Application[]>();
  const [candidateApplicationnn, setCandidateApplicationnn] =
    useState<Application[]>();

  useEffect(() => {
    if (!jobWalletClient) return;
    if (!jobPublicClient) return;
    if (!companyApplications) return;

    // Without auth, show all available submissions.
    setCandidateApplicationnn(companyApplications);
    setCompanyApplicationnn(companyApplications);
  }, [jobPublicClient, jobWalletClient, companyApplications]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-6 sm:px-8 sm:py-7 bg-gradient-to-r from-blue-50 via-white to-emerald-50">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
                    Submissions Dashboard
                  </h1>
                  <p className="text-slate-600 mt-1">
                    {isCandidate
                      ? "Track your profile submissions"
                      : "Review profile submissions from students"}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Identity
                  </span>
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Verified
                  </span>
                  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Under Review
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                <FileText className="w-5 h-5 text-blue-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Total
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                <FileText className="w-5 h-5 text-amber-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Under Review
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Verified
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                  {stats.approved}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-red-50 rounded-xl border border-red-100">
                <X className="w-5 h-5 text-red-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Needs Attention
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                <CheckCircle className="w-5 h-5 text-blue-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Confirmed
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                  {stats.verified}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="p-5 sm:p-6 flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Under Review</option>
                <option value="approved">Verified</option>
                <option value="rejected">Needs Attention</option>
                <option value="verified">Confirmed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "date" | "status" | "company")
                }
                className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="status">Sort by Status</option>
                <option value="company">Sort by Organization</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications Grid */}

        {isCandidate &&
          (candidateApplicationnn && candidateApplicationnn.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {candidateApplicationnn.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application as any}
                  userRole={isCandidate ? "candidate" : "company"}
                  onStatusChange={handleStatusChange}
                  onFileUpload={handleFileUpload}
                  onVerify={handleVerify}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No submissions found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No submissions available at this time"}
              </p>
            </div>
          ))}

        {!isCandidate &&
          (companyApplicationnn && companyApplicationnn.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {companyApplicationnn.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application as any}
                  userRole={isCandidate ? "candidate" : "company"}
                  onStatusChange={handleStatusChange}
                  onFileUpload={handleFileUpload}
                  onVerify={handleVerify}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No submissions found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No submissions available at this time"}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CommonDashboard;
