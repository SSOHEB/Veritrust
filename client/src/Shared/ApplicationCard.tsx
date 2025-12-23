import React from "react";
import {
  Calendar,
  MapPin,
  Check,
  X,
} from "lucide-react";

import type { Application } from "@/types";

interface ApplicationCardProps {
  application: Application;
  userRole: "candidate" | "company";
  onStatusChange: (
    id: string,
    status: Application["status"]
  ) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  userRole,
  onStatusChange,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "reviewed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "accepted": // Canonical "Verified/Approved"
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Under Review";
      case "reviewed":
        return "Credential Review";
      case "accepted":
        return "Verified";
      case "rejected":
        return "Needs Attention";
      default:
        return status;
    }
  };

  // Company can take actions when status is pending
  const canShowCompanyActions =
    userRole === "company" && application.status === "pending";
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 leading-snug truncate">
            {application.job.title}
          </h3>
          <p className="text-sm text-slate-600 font-medium truncate mt-1">
            {application.job.company?.companyName || "-"}
          </p>
        </div>

        <span
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
            application.status
          )}`}
        >
          {getStatusLabel(application.status)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
          <MapPin className="w-4 h-4 text-slate-500" />
          <span className="truncate">{application.job.location || "-"}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="truncate">
            Submitted {new Date(application.appliedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-white">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-700 truncate">
              <span className="font-semibold text-slate-900">Student:</span>{" "}
              {application?.candidate.name || "-"}
            </p>
          </div>
          <p className="text-sm text-slate-600 truncate mt-1">
            <span className="font-semibold text-slate-900">Email:</span>{" "}
            {application.candidate.candidateId || "-"}
          </p>
        </div>
      </div>

      {/* Company Actions - Only show when status is pending */}
      {canShowCompanyActions && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Review Submission:
          </p>
          <div className="flex gap-3">
            <button
              // Directly mark as accepted (Verified)
              onClick={() => onStatusChange(application.id, "accepted")}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
            >
              <Check className="w-4 h-4" />
              Mark Verified
            </button>
            <button
              onClick={() => onStatusChange(application.id, "rejected")}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
            >
              <X className="w-4 h-4" />
              Needs Attention
            </button>
          </div>
        </div>
      )}

      {/* Status History - Simplified for canonical type */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Submission Details
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Profile submitted</span>
            <span>
              {new Date(application.appliedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Current Status</span>
            <span className="capitalize">
              {application.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
