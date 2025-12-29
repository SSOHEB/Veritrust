import React, { useState, useMemo } from "react";
import { Search, FileText, CheckCircle, X } from "lucide-react";
import type { Application } from "../types";
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

  const {
    myApplication, // Candidate's applications
    companyApplications, // Company's received applications
    updateApplicationStatus,
  } = useGlobalContext();

  // Single Source of Truth: Derived from GlobalContext
  // We do NOT copy this to local state. We use it directly.
  const applications: Application[] = useMemo(() => {
    return isCandidate ? (myApplication || []) : (companyApplications || []);
  }, [isCandidate, myApplication, companyApplications]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "status" | "company">("date");

  // === Update application status by company ===
  // Status: "pending" | "reviewed" | "accepted" | "rejected"
  const handleStatusChange = async (id: string, newStatus: Application["status"]) => {
    if (updateApplicationStatus) {
      await updateApplicationStatus(id, newStatus);
    }
  };

  // === Dashboard stats ===
  // Derived strictly from the CURRENT render's applications list
  const stats = useMemo(() => {
    return {
      total: applications.length,
      // "reviewed" maps to "Under Review" count? Or maybe keep separate bucket.
      // UI has: Total, Under Review (pending), Verified (accepted), Needs Attention (rejected), Confirmed (also accepted/verified?)
      // Let's map strict statuses:
      // pending -> pending
      // reviewed -> pending (or separate?)
      // accepted -> verified
      // rejected -> rejected

      // Let's align with the UI buckets:
      // "Under Review" = pending + reviewed
      underReview: applications.filter((a) => a.status === "pending" || a.status === "reviewed").length,
      verified: applications.filter((a) => a.status === "accepted").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
      // "Confirmed" seems redundant with verified in this simple model, or maybe it's "accepted + candidate verified"
      // We will map "Confirmed" to "accepted" for now to fill the bucket.
      confirmed: applications.filter((a) => a.status === "accepted").length,
    };
  }, [applications]);

  // Filter and Sort logic could effectively operate on `applications` here if we wanted client-side search.
  // The UI renders `companyApplicationnn` variable in the old code, which were just mirrors.
  // We will render `applications` directly.

  const displayApplications = useMemo(() => {
    return applications.filter(app => {
      // Filter logic (search + status)
      const matchesSearch = searchTerm === "" ||
        (app.job?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.candidate?.name || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || app.status === statusFilter;

      // Note: UI dropdown has legacy values: "pending", "approved", "rejected", "verified"
      // We need to fix the dropdown values to match canonical ones OR map them.
      // Dropdown values: "pending" | "approved" (=> accepted) | "rejected" | "verified" (=> accepted?)

      if (statusFilter === "all") return matchesSearch;

      if (statusFilter === "pending") return matchesSearch && (app.status === "pending" || app.status === "reviewed");
      if (statusFilter === "approved" || statusFilter === "verified") return matchesSearch && app.status === "accepted";
      if (statusFilter === "rejected") return matchesSearch && app.status === "rejected";

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'date') return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      return 0; // simplified sort
    });
  }, [applications, searchTerm, statusFilter, sortBy]);

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
                  {stats.underReview}
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
                  {stats.verified}
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
                  {stats.confirmed}
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
                <option value="pending">Pending & Reviewing</option>
                <option value="approved">Verified</option>
                <option value="rejected">Needs Attention</option>
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

        {/* Applications Grid replaced by unified display */}
        {displayApplications.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application as any} // Cast safely after type alignment
                userRole={isCandidate ? "candidate" : "company"}
                onStatusChange={handleStatusChange}
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
        )}


      </div>
    </div>
  );
};

export default CommonDashboard;
