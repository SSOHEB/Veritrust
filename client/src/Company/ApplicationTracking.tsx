import { useGlobalContext } from "@/Context/useGlobalContext";
import type { Application } from "@/types";
import { Clock, CheckCircle, Mail, User, MapPin, Star } from "lucide-react";
import { useState } from "react";

export const ApplicationTracking: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const { companyApplications, updateApplicationStatus } = useGlobalContext();

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "bg-yellow-100 text-yellow-800",
      label: "Under Review",
    },
    reviewed: {
      icon: CheckCircle,
      color: "bg-blue-100 text-blue-800",
      label: "Under Review",
    },
    accepted: {
      icon: Star,
      color: "bg-green-100 text-green-800",
      label: "Verified",
    },
    rejected: {
      icon: User,
      color: "bg-red-100 text-red-800",
      label: "Needs Attention",
    },
  };

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: Application["status"]
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

  // Removed updateStatusDirectly in favor of updateApplicationStatus from GlobalContext


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
          <p className="text-gray-600 mt-1">
            Review and update student profile submissions
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedStatus === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            All ({(companyApplications || []).length})
          </button>
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = (companyApplications || []).filter(
              (app) => app.status === status
            ).length;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No submissions found
            </h3>
            <p className="text-gray-600">
              Submissions will appear here when students submit profiles for your jobs
            </p>
          </div>
        ) : (
          companyApplications &&
          companyApplications
            .filter(app => selectedStatus === 'all' || app.status === selectedStatus)
            .map((application) => {
              // Default to pending if status is unknown/invalid
              const statusKey = (statusConfig[application.status as keyof typeof statusConfig] ? application.status : "pending") as keyof typeof statusConfig;

              const StatusIcon = statusConfig[statusKey]?.icon || User;
              const statusStyle =
                statusConfig[statusKey]?.color ||
                "bg-gray-100 text-gray-800";

              return (
                <div
                  key={application.id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {(application.candidate.name ?? "?").charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {application.candidate.name}
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Submitted for
                          </p>
                          <p className="text-gray-900">{application.job?.title || "Unknown Job"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Location
                          </p>
                          <p className="text-gray-900 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {application.candidate.contacts?.[2] ||
                              "Location not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Submitted
                          </p>
                          <p className="text-gray-900">
                            {new Date(application.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(application.candidate.skills ?? []).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="flex space-y-6 flex-col mt-4">
                          <p className="text-md font-bold text-gray-700 mb-2">
                            Description
                          </p>
                          <p className="text-gray-600">
                            {application.candidate.description?.[0] ||
                              "No description available"}
                          </p>
                        </div>
                      </div>

                    </div>

                    <div className="ml-6 flex flex-col items-end space-y-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyle}`}
                      >
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusConfig[statusKey]?.label || application.status}
                      </span>

                      <div className="flex flex-col space-y-2">
                        {application.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(application.id, "reviewed")
                              }
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              Mark Under Review
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(application.id, "rejected")
                              }
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              Needs Attention
                            </button>
                          </>
                        )}

                        {(application.status === "reviewed" || application.status === "pending") && ( // Allow accepting from pending too, why not
                          <>
                            {application.status === "reviewed" && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(application.id, "accepted")
                                }
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                Mark Verified
                              </button>
                            )}

                            {/* Show Reject if reviewed as well */}
                            {application.status === "reviewed" && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(application.id, "rejected")
                                }
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                              >
                                Needs Attention
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="text-gray-500 hover:text-blue-600 text-sm underline"
                      >
                        View Details
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Submission Details
              </h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xl">
                    {(selectedApplication.candidate.name ?? "?").charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {selectedApplication.candidate.name}
                  </h3>
                  <p className="text-gray-600">
                    {selectedApplication.candidate.description?.[0] ||
                      "No description"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedApplication.candidate.email ||
                      selectedApplication.candidate.contacts?.[0]}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile score field disabled */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Education
                  </p>
                  <p className="text-gray-900">
                    {selectedApplication.candidate.education?.[0] ||
                      "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Location
                  </p>
                  <p className="text-gray-900">
                    {selectedApplication.candidate.contacts?.[2] ||
                      "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </p>
                  <p className="text-gray-900">
                    {selectedApplication.candidate.contacts?.[1] ||
                      "Not provided"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Description
                </p>
                <p className="text-gray-900">
                  {selectedApplication.candidate.description?.[0] ||
                    "No description available"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedApplication.candidate.skills ?? []).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
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
