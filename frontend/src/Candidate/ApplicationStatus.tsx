import type { Application } from "../types";
import {
  Clock,
  CheckCircle,
  FileText,
  Star,
  Building2,
  MapPin,
  DollarSign,
} from "lucide-react";
import { useGlobalContext } from "@/Context/useGlobalContext";

// Mock data
// const mockApplications: Application[] = [
//   {
//     id: "1",
//     jobId: "1",
//     candidateId: "2",
//     job: {
//       id: "1",
//       companyId: "1",
//       company: {
//         id: "1",
//         name: "Tech Innovators Inc",
//         companyName: "Tech Innovators Inc",
//         industry: "Technology",
//         size: "100-500",
//         description: "Leading AI and software development company",
//       } as Company,
//       title: "Senior Frontend Developer",
//       description: "Looking for a skilled Frontend Developer",
//       requirements: ["5+ years React experience", "TypeScript proficiency"],
//       skills: ["React", "TypeScript", "JavaScript"],
//       location: "San Francisco, CA",
//       type: "full-time",
//       salary: { min: 120000, max: 180000, currency: "USD" },
//       postedAt: "2024-01-10",
//       status: "active",
//     } as Job,
//     candidate: {
//       id: "2",
//       email: "candidate@demo.com",
//       name: "John Developer",
//       type: "candidate",
//       createdAt: "2024-01-01",
//       title: "Senior Frontend Developer",
//       experience: 5,
//       skills: ["React", "TypeScript", "Node.js"],
//       location: "San Francisco, CA",
//       bio: "Passionate developer",
//       education: "BS Computer Science",
//     } as Candidate,
//     status: "pending",
//     appliedAt: "2024-01-15",
//     compatibilityScore: 85,
//     aiApplied: false,
//   },
//   {
//     id: "2",
//     jobId: "2",
//     candidateId: "2",
//     job: {
//       id: "2",
//       companyId: "1",
//       company: {
//         id: "1",
//         name: "AI Startup",
//         companyName: "AI Startup",
//         industry: "Technology",
//         size: "50-100",
//         description: "Cutting-edge AI company",
//       } as Company,
//       title: "ML Engineer",
//       description: "Machine learning engineer position",
//       requirements: ["Python", "TensorFlow", "3+ years experience"],
//       skills: ["Python", "TensorFlow", "Machine Learning"],
//       location: "Remote",
//       type: "full-time",
//       salary: { min: 130000, max: 200000, currency: "USD" },
//       postedAt: "2024-01-12",
//       status: "active",
//     } as Job,
//     candidate: {
//       id: "2",
//       email: "candidate@demo.com",
//       name: "John Developer",
//       type: "candidate",
//       createdAt: "2024-01-01",
//       title: "Senior Frontend Developer",
//       experience: 5,
//       skills: ["React", "TypeScript", "Node.js"],
//       location: "San Francisco, CA",
//       bio: "Passionate developer",
//       education: "BS Computer Science",
//     } as Candidate,
//     status: "interview_scheduled",
//     appliedAt: "2024-01-14",
//     compatibilityScore: 78,
//     aiApplied: true,
//   },
// ];

export const ApplicationStatus: React.FC = () => {
  // Mock candidate data
  // const candidate: Candidate = {
  //   id: "2",
  //   email: "candidate@demo.com",
  //   name: "John Developer",
  //   type: "candidate",
  //   createdAt: "2024-01-01",
  //   title: "Senior Frontend Developer",
  //   experience: 5,
  //   skills: ["React", "TypeScript", "Node.js"],
  //   location: "San Francisco, CA",
  //   bio: "Passionate developer",
  //   education: "BS Computer Science",
  // };

  // const candidateApplications = mockApplications.filter(
  //   (app: Application) => app.candidateId === candidate.id
  // );

  type StatusKey =
    | "pending"
    | "application_accepted"
    | "offer_given"
    | "rejected";

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
    application_accepted: {
      icon: CheckCircle,
      color: "bg-blue-100 text-blue-800 border-blue-200",
      label: "Application Accepted",
      description: "Congratulations! Your application has been accepted",
    },
    offer_given: {
      icon: FileText,
      color: "bg-orange-100 text-orange-800 border-orange-200",
      label: "Offer Letter Received",
      description: "Congratulations! You have received a job offer",
    },
    rejected: {
      icon: Clock,
      color: "bg-red-100 text-red-800 border-red-200",
      label: "Not Selected",
      description:
        "Thank you for your interest. Keep applying to find the right fit",
    },
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      "pending",
      "application_accepted",
      "interview_scheduled",
      "interview_completed",
      "offer_given",
      "offer_accepted",
    ];

    if (currentStatus === "rejected") {
      return ["pending", "rejected"];
    }

    const currentIndex = steps.indexOf(currentStatus);
    return steps.slice(0, currentIndex + 1);
  };

  const { myApplication } = useGlobalContext();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-1">
          Track the status of your job applications
        </p>
      </div>

      {myApplication && myApplication.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
          {myApplication &&
            myApplication.map((application: Application) => {
              const statusInfo = statusConfig[application.status as StatusKey];
              const StatusIcon = statusInfo.icon;
              const statusSteps = getStatusSteps(application.status);

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
                            {application.job.title}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {/* @ts-ignore */}
                            {application.job.companyName}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{application.job.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>
                                ${application.job.salary.min.toLocaleString()} -
                                ${application.job.salary.max.toLocaleString()}
                              </span>
                            </div>
                            <span>
                              Applied{" "}
                              {new Date(
                                application.appliedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {application.aiApplied && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                            AI Applied
                          </span>
                        )}
                        {application.compatibilityScore && (
                          <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            <Star className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {application.compatibilityScore}% match
                            </span>
                          </div>
                        )}
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}
                        >
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Application Progress
                      </h4>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                        <span>View Details</span>
                      </button>
                    </div>

                    <div className="relative">
                      <div className="flex justify-between">
                        {[
                          "pending",
                          "application_accepted",
                          "offer_given",
                          "rejected",
                        ].map((step, index) => {
                          const isCompleted = statusSteps.includes(step);
                          const isCurrent = application.status === step;
                          const stepConfig = statusConfig[step as StatusKey];
                          const StepIcon = stepConfig.icon;

                          return (
                            <div
                              key={step}
                              className="flex flex-col items-center relative"
                            >
                              <div
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                                  isCompleted
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : isCurrent
                                    ? "bg-blue-100 border-blue-600 text-blue-600"
                                    : "bg-gray-100 border-gray-300 text-gray-400"
                                }`}
                              >
                                <StepIcon className="w-5 h-5" />
                              </div>
                              <span
                                className={`text-xs mt-2 text-center max-w-20 ${
                                  isCompleted || isCurrent
                                    ? "text-gray-900 font-medium"
                                    : "text-gray-500"
                                }`}
                              >
                                {stepConfig.label.replace(" ", "\n")}
                              </span>

                              {index < 5 && (
                                <div
                                  className={`absolute top-5 left-12 w-36 h-0.5 ${
                                    statusSteps.includes(
                                      [
                                        "pending",
                                        "application_accepted",
                                        "interview_scheduled",
                                        "interview_completed",
                                        "offer_given",
                                        "offer_accepted",
                                      ][index + 1]
                                    )
                                      ? "bg-blue-600"
                                      : "bg-gray-300"
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
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
