import { useGlobalContext } from "@/Context/useGlobalContext";
import { ApplicationStatus, type Application } from "@/types";
import { Clock, CheckCircle, Mail, User, MapPin, Star, ShieldCheck } from "lucide-react";
import { useState } from "react";

export const ApplicationTracking: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const { companyApplications, updateApplicationStatus } = useGlobalContext();

  const statusConfig = {
    [ApplicationStatus.APPLIED]: { // "pending"
      icon: Clock,
      color: "bg-slate-100 text-slate-700 border border-slate-200",
      label: "Pending Review",
    },
    [ApplicationStatus.UNDER_REVIEW]: { // "reviewed"
      icon: CheckCircle,
      color: "bg-blue-50 text-blue-800 border border-blue-200",
      label: "Under Review",
    },
    [ApplicationStatus.ACCEPTED]: { // "accepted"
      icon: Star,
      color: "bg-emerald-50 text-emerald-800 border border-emerald-200",
      label: "Accepted",
    },
    [ApplicationStatus.REJECTED]: { // "rejected"
      icon: User,
      color: "bg-rose-50 text-rose-800 border border-rose-200",
      label: "Rejected",
    },
    [ApplicationStatus.EXAM_INVITED]: { // "exam_invited"
      icon: Mail,
      color: "bg-purple-50 text-purple-800 border border-purple-200",
      label: "Exam Invited"
    }
  };

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => {
    if (updateApplicationStatus) {
      await updateApplicationStatus(applicationId, newStatus);

      // Update local state if selected
      if (selectedApplication && selectedApplication.id === applicationId) {
        setSelectedApplication({
          ...selectedApplication,
          status: newStatus,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Review Queue</h1>
          <p className="text-slate-600 mt-1">
            Review and update student profile submissions
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedStatus === "all"
              ? "bg-[#0B1F3A] text-white shadow-sm"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
          >
            All ({(companyApplications || []).length})
          </button>
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = (companyApplications || []).filter(
              (app) => app.status === status
            ).length;
            const isActive = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isActive
                  ? "bg-[#0B1F3A] text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {companyApplications && companyApplications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">
              No submissions found
            </h3>
            <p className="text-slate-600 max-w-sm mx-auto">
              Submissions will appear here when students submit profiles for your jobs.
            </p>
          </div>
        ) : (
          companyApplications &&
          companyApplications
            .filter(app => selectedStatus === 'all' || app.status === selectedStatus)
            .map((application) => {
              // Default to pending if status is unknown/invalid
              const statusKey = (statusConfig[application.status as ApplicationStatus] ? application.status : ApplicationStatus.APPLIED) as ApplicationStatus;

              const StatusIcon = statusConfig[statusKey]?.icon || User;
              const statusStyle =
                statusConfig[statusKey]?.color ||
                "bg-slate-100 text-slate-800";

              const isVerified = application.candidate.verification?.status === "verified";

              return (
                <div
                  key={application.id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-[#0B1F3A]/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-[#0B1F3A] rounded-lg flex items-center justify-center shadow-sm relative">
                          <span className="text-white font-serif font-semibold text-lg">
                            {(application.candidate.name ?? "?").charAt(0)}
                          </span>
                          {isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                              <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-serif font-bold text-slate-900">
                              {application.candidate.name}
                            </h3>
                            {isVerified ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                                <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200 uppercase tracking-wide">
                                Unverified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 font-mono mt-0.5">
                            ID: {application.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-6">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Submitted for
                          </p>
                          <p className="text-slate-900 font-medium">{application.job?.title || "Unknown Job"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Location
                          </p>
                          <p className="text-slate-900 flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                            {application.candidate.contacts?.[2] ||
                              "Location not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Submission Date
                          </p>
                          <p className="text-slate-900 font-mono text-sm">
                            {new Date(application.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(application.candidate.skills ?? []).map((skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="flex space-y-6 flex-col mt-5">
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Description
                            </p>
                            <p className="text-slate-600 text-sm leading-relaxed">
                              {application.candidate.description?.[0] ||
                                "No description available"}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="ml-8 flex flex-col items-end space-y-3 min-w-[180px]">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase tracking-wide ${statusStyle}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                        {statusConfig[statusKey]?.label || application.status}
                      </span>

                      <div className="flex flex-col space-y-2 w-full pt-2">
                        {application.status === ApplicationStatus.APPLIED && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(application.id, ApplicationStatus.UNDER_REVIEW)
                              }
                              className="w-full px-4 py-2 bg-[#0B1F3A] text-white rounded-lg hover:bg-[#1E293B] transition-colors text-sm font-medium shadow-sm"
                            >
                              Mark Under Review
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(application.id, ApplicationStatus.REJECTED)
                              }
                              className="w-full px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                            >
                              Request Info
                            </button>
                          </>
                        )}

                        {(application.status === ApplicationStatus.UNDER_REVIEW || application.status === ApplicationStatus.APPLIED) && (
                          <>
                            {application.status === ApplicationStatus.UNDER_REVIEW && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(application.id, ApplicationStatus.ACCEPTED)
                                }
                                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
                              >
                                Accept Application
                              </button>
                            )}

                            {application.status === ApplicationStatus.UNDER_REVIEW && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(application.id, ApplicationStatus.REJECTED)
                                }
                                className="w-full px-4 py-2 bg-white border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-50 transition-colors text-sm font-medium"
                              >
                                Reject
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="text-slate-500 hover:text-[#0B1F3A] text-sm font-medium hover:underline pt-2"
                      >
                        View Full Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Submission Details
              </h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Close modal"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="flex items-center space-x-5 mb-8">
                <div className="w-20 h-20 bg-[#0B1F3A] rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-serif font-bold text-3xl">
                    {(selectedApplication.candidate.name ?? "?").charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900">
                    {selectedApplication.candidate.name}
                  </h3>
                  {/* Verification Badge in Modal */}
                  {(selectedApplication.candidate.verification?.status === "verified") && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Candidate (ZK Proof)
                    </span>
                  )}
                  <p className="text-slate-600 mt-1">
                    {selectedApplication.job?.title || "Applicant"}
                  </p>
                  <p className="text-sm font-mono text-slate-500 mt-1">
                    {selectedApplication.candidate.email ||
                      selectedApplication.candidate.contacts?.[0]}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Education
                  </p>
                  <p className="text-slate-900 font-medium">
                    {selectedApplication.candidate.education?.[0] ||
                      "Not specified"}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Location
                  </p>
                  <p className="text-slate-900 font-medium">
                    {selectedApplication.candidate.contacts?.[2] ||
                      "Not specified"}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  About Candidate
                </p>
                <div className="prose prose-sm text-slate-600 max-w-none">
                  <p>
                    {selectedApplication.candidate.description?.[0] ||
                      "No description available"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedApplication.candidate.skills ?? []).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 text-sm font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Close View
              </button>
              <button className="px-5 py-2.5 bg-[#0B1F3A] text-white rounded-lg hover:bg-[#1E293B] transition-colors flex items-center space-x-2 font-medium shadow-sm">
                <Mail className="w-4 h-4" />
                <span>Contact Student</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
