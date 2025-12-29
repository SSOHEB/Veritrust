import React from "react";
import {
  Calendar,
  MapPin,
  Check,
  X,
  Clock,
  Eye,
  ShieldCheck
} from "lucide-react";

import { type Application, ApplicationStatus } from "@/types";

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

  const statusConfig = {
    [ApplicationStatus.APPLIED]: {
      label: "Pending Review",
      color: "bg-amber-100 text-amber-800 border-amber-200",
      icon: Clock
    },
    [ApplicationStatus.UNDER_REVIEW]: {
      label: "Under Review",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Eye
    },
    [ApplicationStatus.ACCEPTED]: {
      label: "Verified",
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: ShieldCheck
    },
    [ApplicationStatus.REJECTED]: {
      label: "Needs Attention",
      color: "bg-rose-100 text-rose-800 border-rose-200",
      icon: X
    },
    [ApplicationStatus.EXAM_INVITED]: {
      label: "Exam Invited",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: Eye
    }
  };

  // Safe accessor for status config
  const currentConfig = statusConfig[application.status as ApplicationStatus] || statusConfig[ApplicationStatus.APPLIED];

  // Company Actions Logic
  const canShowCompanyActions = userRole === "company";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 leading-snug truncate">
            {application.job.title}
          </h3>
          <p className="text-sm text-slate-600 font-medium truncate mt-1">
            {application.job.company?.companyName || "-"}
          </p>
        </div>

        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentConfig.color}`}
        >
          {currentConfig.label}
        </span>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 mb-4">
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

      <div className="rounded-xl border border-slate-100 bg-white mb-4 flex-grow">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-700 truncate">
              <span className="font-semibold text-slate-900">Student:</span>{" "}
              {application?.candidate.name || "-"}
            </p>
          </div>
          <p className="text-sm text-slate-600 truncate mt-1">
            <span className="font-semibold text-slate-900">Email:</span>{" "}
            {application.candidate.candidateId || application.candidate.email || "-"}
          </p>
        </div>
      </div>

      {/* Company Actions */}
      {
        canShowCompanyActions && (
          <div className="mt-auto border-t border-slate-100 pt-4">
            {application.status === ApplicationStatus.APPLIED && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onStatusChange(application.id, ApplicationStatus.UNDER_REVIEW)}
                  className="flex justify-center items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                >
                  Review
                </button>
                <button
                  onClick={() => onStatusChange(application.id, ApplicationStatus.REJECTED)}
                  className="flex justify-center items-center gap-2 px-3 py-2 bg-white border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-50 transition-colors text-sm font-medium"
                >
                  Reject
                </button>
              </div>
            )}

            {application.status === ApplicationStatus.UNDER_REVIEW && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onStatusChange(application.id, ApplicationStatus.ACCEPTED)}
                  className="flex justify-center items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
                >
                  <Check className="w-4 h-4" /> Verify
                </button>
                <button
                  onClick={() => onStatusChange(application.id, ApplicationStatus.REJECTED)}
                  className="flex justify-center items-center gap-2 px-3 py-2 bg-white border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-50 transition-colors text-sm font-medium"
                >
                  Needs Info
                </button>
              </div>
            )}

            {(application.status === ApplicationStatus.ACCEPTED || application.status === ApplicationStatus.REJECTED) && (
              <p className="text-center text-xs text-slate-400 font-medium italic">
                {application.status === ApplicationStatus.ACCEPTED ? "Application Verified" : "Application Rejected"}
              </p>
            )}
          </div>
        )
      }

      {/* Status History / Details text */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Status</span>
          <span className="font-semibold text-slate-700">{currentConfig.label}</span>
        </div>
      </div>
    </div >
  );
};

export default ApplicationCard;
