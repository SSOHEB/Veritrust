import React, { useEffect, useMemo, useState } from "react";
import type { Application } from "../types";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  MapPin,
  DollarSign,
  Loader,
  AlertCircle,
} from "lucide-react";
import { app } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

interface ApplicationWithSnapshots {
  id: string;
  candidateId: string;
  jobId: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  appliedAt: string;
  jobSnapshot: {
    title: string;
    companyName: string;
    location?: string;
    salary?: { min: number; max: number };
  };
}

type StatusKey = "pending" | "reviewed" | "accepted" | "rejected";

const statusConfig: Record<
  StatusKey,
  {
    icon: React.FC<any>;
    color: string;
    label: string;
    description: string;
  }
> = {
  pending: {
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "Pending Review",
    description: "Your application is being reviewed by the hiring team",
  },
  reviewed: {
    icon: Eye,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Application Reviewed",
    description: "Your application has been reviewed",
  },
  accepted: {
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Accepted",
    description: "Congratulations! Your application has been accepted",
  },
  rejected: {
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-200",
    label: "Not Selected",
    description:
      "Thank you for your interest. Keep applying to find the right fit",
  },
};

export const ApplicationStatus: React.FC = () => {
  const auth = useMemo(() => getAuth(app), []);
  const db = useMemo(() => getFirestore(app), []);

  const [applications, setApplications] = useState<ApplicationWithSnapshots[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        setError(null);
        setLoading(true);

        if (!user) {
          setApplications([]);
          setError("You must be signed in to view your applications.");
          return;
        }

        const applicationsRef = collection(db, "applications");
        const q = query(applicationsRef, where("candidateId", "==", user.uid));
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">
            Track the status of your job applications
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
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">
            Track the status of your job applications
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-1">
          Track the status of your job applications
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No applications yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start exploring job opportunities and apply to positions that match
            your skills
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => {
            const statusInfo = statusConfig[application.status];
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={application.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {application.jobSnapshot.title}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {application.jobSnapshot.companyName}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {application.jobSnapshot.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{application.jobSnapshot.location}</span>
                            </div>
                          )}
                          {application.jobSnapshot.salary && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>
                                ${application.jobSnapshot.salary.min.toLocaleString()}{" "}
                                - $
                                {application.jobSnapshot.salary.max.toLocaleString()}
                              </span>
                            </div>
                          )}
                          <span>
                            Applied{" "}
                            {new Date(
                              application.appliedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}
                    >
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Status Info */}
                <div className="p-6 bg-gray-50">
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      {statusInfo.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
