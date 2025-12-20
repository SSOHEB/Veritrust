import React, { useState, useMemo, useEffect } from "react";
import { Search, FileText, CheckCircle, X } from "lucide-react";
import type { Application, Application1 } from "../types";
import ApplicationCard from "./ApplicationCard";
import { usePrivy } from "@privy-io/react-auth";
import { useGlobalContext } from "@/Context/useGlobalContext";

const CommonDashboard: React.FC = () => {
  const { user: currentUser } = usePrivy();

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
  const handleStatusChange = (id: string, status: "approved" | "rejected") => {
    // Call context function to update status in backend/contract
    if (updateApplicationStatus) {
      updateApplicationStatus(id, status);
    }

    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              status, // This updates the main status for both sides
              companyAction: {
                status,
                actionDate: new Date().toISOString(),
              },
            }
          : app
      )
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
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesSearch =
          searchTerm === "" ||
          app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.candidateName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || app.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date":
            return (
              new Date(b.appliedDate).getTime() -
              new Date(a.appliedDate).getTime()
            );
          case "status":
            return a.status.localeCompare(b.status);
          case "company":
            return a.companyName.localeCompare(b.companyName);
          default:
            return 0;
        }
      });
  }, [applications, searchTerm, statusFilter, sortBy]);

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
    if (!currentUser) return;
    if (!companyApplications) return;

    console.log(
      "jobWalletClient, jobPublicClient, currentUser, companyApplications"
    );
    console.log("dsa ", currentUser, companyApplications);
    // Fetch applications based on
    console.log("app >> ", companyApplications);

    const myApps = companyApplications.filter(
      (app) => app.candidateId === currentUser.google?.email
    );

    console.log(myApps, "my app company");
    setCandidateApplicationnn(myApps);

    const myApps2 = companyApplications.filter(
      (app) => app.job.companyId === currentUser.google?.email
    );
    setCompanyApplicationnn(myApps2);

    console.log(myApps, "my app company : ", currentUser.google?.email);
    console.log(myApps2, "my app company 2");
  }, [jobPublicClient, jobWalletClient, currentUser, companyApplications]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Applications Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              {currentUser &&
              currentUser.customMetadata &&
              currentUser.customMetadata.role &&
              currentUser &&
              currentUser.customMetadata &&
              currentUser.customMetadata.role === "candidate"
                ? "Track and verify job applications"
                : "Review and process job applications"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.approved}
                </p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.rejected}
                </p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.verified}
                </p>
                <p className="text-sm text-gray-600">Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="verified">Verified</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "date" | "status" | "company")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
            <option value="company">Sort by Company</option>
          </select>
        </div>

        {/* Applications Grid */}

        {currentUser &&
          currentUser.customMetadata &&
          currentUser.customMetadata.role === "candidate" &&
          (candidateApplicationnn && candidateApplicationnn.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {candidateApplicationnn.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application as any}
                  userRole={
                    (currentUser?.customMetadata?.role as
                      | "candidate"
                      | "company") || "candidate"
                  }
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
                No applications found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No applications available at this time"}
              </p>
            </div>
          ))}

        {currentUser &&
          currentUser.customMetadata &&
          currentUser.customMetadata.role === "company" &&
          (companyApplicationnn && companyApplicationnn.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {companyApplicationnn.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application as any}
                  userRole={
                    (currentUser?.customMetadata?.role as
                      | "candidate"
                      | "company") || "candidate"
                  }
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
                No applications found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No applications available at this time"}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CommonDashboard;
