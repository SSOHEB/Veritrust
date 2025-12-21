import React, { useEffect, useMemo, useState } from "react";
import type { Application, Company } from "@/types";
import {
  Clock,
  CheckCircle,
  Mail,
  User,
  MapPin,
  Loader,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { app } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

interface ApplicationWithSnapshots {
  id: string;
  companyId: string;
  candidateId: string;
  jobId: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  appliedAt: string;
  candidateSnapshot: {
    name: string;
    email: string;
    skills?: string[];
    experience?: number;
  };
  jobSnapshot: {
    title: string;
    companyName: string;
  };
}

type StatusKey = "pending" | "reviewed" | "accepted" | "rejected";

const statusConfig: Record<
  StatusKey,
  {
    icon: React.FC<any>;
    color: string;
    label: string;
  }
> = {
  pending: {
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800",
    label: "Pending Review",
  },
  reviewed: {
    icon: CheckCircle,
    color: "bg-blue-100 text-blue-800",
    label: "Reviewed",
  },
  accepted: {
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
    label: "Accepted",
  },
  rejected: {
    icon: XCircle,
    color: "bg-red-100 text-red-800",
    label: "Rejected",
  },
};

export const ApplicationTracking: React.FC = () => {
  const auth = useMemo(() => getAuth(app), []);
  const db = useMemo(() => getFirestore(app), []);

  const [applications, setApplications] = useState<ApplicationWithSnapshots[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationWithSnapshots | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        setError(null);
        setLoading(true);

        if (!user) {
          setApplications([]);
          setError("You must be signed in to view applications.");
          return;
        }

        const applicationsRef = collection(db, "applications");
        const q = query(applicationsRef, where("companyId", "==", user.uid));
        const snapshot = await getDocs(q);

        const apps: ApplicationWithSnapshots[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ApplicationWithSnapshots[];

        setApplications(apps);
      } catch (e) {
        console.error(e);
        setError("Failed to load applications.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [auth, db]);

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: StatusKey
  ) => {
    try {
      setUpdating(applicationId);
      const ref = doc(db, "applications", applicationId);
      await updateDoc(ref, { status: newStatus });

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      if (selectedApplication?.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update application status.");
    } finally {
      setUpdating(null);
    }
  };

  const filteredApplications =
    selectedStatus === "all"
      ? applications
      : applications.filter((app) => app.status === selectedStatus);

  const getCount = (status: string) => {
    return applications.filter((app) => app.status === status).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Application Tracking
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track candidate applications
          </p>
        </div>
        <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-100">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading applications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Application Tracking
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track candidate applications
          </p>
        </div>
        <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-red-100">
          <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
          <span className="text-red-600">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Application Tracking
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track candidate applications
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              selectedStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({applications.length})
          </button>
          {Object.entries(statusConfig).map(([status]) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {statusConfig[status as StatusKey].label} ({getCount(status)})
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No applications found
            </h3>
            <p className="text-gray-600">
              Applications will appear here when candidates apply to your jobs
            </p>
          </div>
        ) : (
          filteredApplications.map((application) => {
            const StatusIcon = statusConfig[application.status].icon;
            const statusStyle = statusConfig[application.status].color;

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
                          {application.candidateSnapshot.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {application.candidateSnapshot.name}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Applied for
                        </p>
                        <p className="text-gray-900">
                          {application.jobSnapshot.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Email
                        </p>
                        <p className="text-gray-900">
                          {application.candidateSnapshot.email}
                        </p>
                      </div>
                      {application.candidateSnapshot.experience && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Experience
                          </p>
                          <p className="text-gray-900">
                            {application.candidateSnapshot.experience} years
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Applied
                        </p>
                        <p className="text-gray-900">
                          {new Date(
                            application.appliedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {application.candidateSnapshot.skills &&
                      application.candidateSnapshot.skills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Skills
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {application.candidateSnapshot.skills.map(
                              (skill) => (
                                <span
                                  key={skill}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="ml-6 flex flex-col items-end space-y-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyle}`}
                    >
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {statusConfig[application.status].label}
                    </span>

                    <div className="flex flex-col space-y-2">
                      {application.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(application.id, "reviewed")
                            }
                            disabled={updating === application.id}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                          >
                            {updating === application.id
                              ? "Updating..."
                              : "Mark as Reviewed"}
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(application.id, "rejected")
                            }
                            disabled={updating === application.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                          >
                            {updating === application.id ? "Updating..." : "Reject"}
                          </button>
                        </>
                      )}

                      {application.status === "reviewed" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(application.id, "accepted")
                            }
                            disabled={updating === application.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                          >
                            {updating === application.id ? "Updating..." : "Accept"}
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(application.id, "rejected")
                            }
                            disabled={updating === application.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                          >
                            {updating === application.id ? "Updating..." : "Reject"}
                          </button>
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
                Application Details
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
                    {selectedApplication.candidateSnapshot.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {selectedApplication.candidateSnapshot.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedApplication.candidateSnapshot.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Applied for
                  </p>
                  <p className="text-gray-900">
                    {selectedApplication.jobSnapshot.title}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Company
                  </p>
                  <p className="text-gray-900">
                    {selectedApplication.jobSnapshot.companyName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Email
                  </p>
                  <p className="text-gray-900">
                    {selectedApplication.candidateSnapshot.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Applied Date
                  </p>
                  <p className="text-gray-900">
                    {new Date(
                      selectedApplication.appliedAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedApplication.candidateSnapshot.experience && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                  </p>
                  <p className="text-gray-900">
                    {selectedApplication.candidateSnapshot.experience} years
                  </p>
                </div>
              )}

              {selectedApplication.candidateSnapshot.skills &&
                selectedApplication.candidateSnapshot.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.candidateSnapshot.skills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
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
                <span>Contact Candidate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
