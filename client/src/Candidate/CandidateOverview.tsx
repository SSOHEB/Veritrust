import React from "react";
import type { Candidate, Application, Job, Company } from "../types";
import { FileText, TrendingUp, Eye, CheckCircle, Clock } from "lucide-react";

// Mock candidate data
const mockCandidate: Candidate = {
  candidateId: "2",
  email: "john.developer@example.com",
  name: "John Developer",
  description: ["Passionate developer with 5+ years of experience"],
  contacts: ["john.developer@example.com", "+1-555-0123", "San Francisco, CA"],
  education: ["BS Computer Science"],
  skills: ["React", "TypeScript", "Node.js", "JavaScript"],
  resumePath: [""],
  profileScore: "",
};

// Mock data
const mockApplications: Application[] = [
  {
    id: "1",
    jobId: "1",
    candidateId: "2",
    job: {
      id: "1",
      companyId: "1",
      company: {
        id: "1",
        name: "Tech Innovators Inc",
        companyName: "Tech Innovators Inc",
        industry: "Technology",
        size: "100-500",
        description: "Leading software development company",
      } as Company,
      title: "Senior Frontend Developer",
      description: "Looking for a skilled Frontend Developer",
      requirements: ["5+ years React experience", "TypeScript proficiency"],
      skills: ["React", "TypeScript", "JavaScript"],
      location: "San Francisco, CA",
      type: "full-time",
      salary: { min: 120000, max: 180000, currency: "USD" },
      postedAt: "2024-01-10",
      status: "active",
    } as Job,
    candidate: {
      id: "2",
      email: "candidate@demo.com",
      name: "John Developer",
      type: "candidate",
      createdAt: "2024-01-01",
      title: "Senior Frontend Developer",
      experience: 5,
      skills: ["React", "TypeScript", "Node.js"],
      location: "San Francisco, CA",
      bio: "Passionate developer",
      education: "BS Computer Science",
    } as Candidate,
    status: "pending",
    appliedAt: "2024-01-15",
    // Extra fields removed
  },
  {
    id: "2",
    jobId: "2",
    candidateId: "2",
    job: {
      id: "2",
      companyId: "1",
      company: {
        id: "1",
        name: "Startup",
        companyName: "Startup",
        industry: "Technology",
        size: "50-100",
        description: "High-growth software company",
      } as Company,
      title: "Backend Engineer",
      description: "Backend engineering position",
      requirements: ["Python", "SQL", "3+ years experience"],
      skills: ["Python", "SQL", "APIs"],
      location: "Remote",
      type: "full-time",
      salary: { min: 130000, max: 200000, currency: "USD" },
      postedAt: "2024-01-12",
      status: "active",
    } as Job,
    candidate: {
      id: "2",
      email: "candidate@demo.com",
      name: "John Developer",
      type: "candidate",
      createdAt: "2024-01-01",
      title: "Senior Frontend Developer",
      experience: 5,
      skills: ["React", "TypeScript", "Node.js"],
      location: "San Francisco, CA",
      bio: "Passionate developer",
      education: "BS Computer Science",
    } as Candidate,
    status: "reviewed",
    appliedAt: "2024-01-14",
    // Extra fields removed
  },
];

const mockJobs: Job[] = [
  {
    id: "3",
    companyId: "1",
    company: {
      id: "1",
      name: "Tech Corp",
      companyName: "Tech Corp",
      industry: "Technology",
      size: "500-1000",
      description: "Leading technology company",
    } as Company,
    title: "Senior React Developer",
    description: "Looking for experienced React developer",
    requirements: ["React", "TypeScript", "5+ years experience"],
    skills: ["React", "TypeScript", "JavaScript", "Node.js"],
    location: "San Francisco, CA",
    type: "full-time",
    salary: { min: 140000, max: 190000, currency: "USD" },
    postedAt: "2024-01-16",
    status: "active",
  },
  {
    id: "4",
    companyId: "2",
    company: {
      id: "2",
      name: "StartupCo",
      companyName: "StartupCo",
      industry: "Technology",
      size: "10-50",
      description: "Fast-growing startup",
    } as Company,
    title: "Full Stack Engineer",
    description: "Full stack development role",
    requirements: ["JavaScript", "Node.js", "React"],
    skills: ["JavaScript", "Node.js", "React", "PostgreSQL"],
    location: "Remote",
    type: "full-time",
    salary: { min: 100000, max: 150000, currency: "USD" },
    postedAt: "2024-01-14",
    status: "active",
  },
];

export const CandidateOverview: React.FC = () => {
  const candidate = mockCandidate;

  const candidateApplications = mockApplications.filter(
    (app: Application) => app.candidateId === candidate.candidateId
  );
  const pendingApplications = candidateApplications.filter(
    (app: Application) => app.status === "pending"
  );
  const acceptedApplications = candidateApplications.filter(
    (app: Application) => app.status !== "pending" && app.status !== "rejected"
  );

  const stats = [
    {
      label: "Profile Submissions",
      value: candidateApplications.length,
      icon: FileText,
      color: "bg-blue-500",
      trend: "+5 this week",
    },
    {
      label: "Under Review",
      value: pendingApplications.length,
      icon: Clock,
      color: "bg-yellow-500",
      trend: "Updates pending",
    },
    {
      label: "Verified",
      value: acceptedApplications.length,
      icon: CheckCircle,
      color: "bg-green-500",
      trend: "Credentials verified",
    },
    // Extra stat removed
  ];

  const recentJobs = mockJobs.slice(0, 4);

  const getStatusLabel = (status: Application["status"]) => {
    switch (status) {
      case "pending":
      case "reviewed":
        return "Under Review";
      case "accepted":
        return "Verified";
      case "rejected":
        return "Needs Attention";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-6 bg-gradient-to-r from-blue-50 via-white to-emerald-50">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Welcome back, {candidate.name}
          </h1>
          <p className="text-slate-600 mt-1">
            Track your profile submissions and browse new jobs.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-semibold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center shadow-sm`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
                <span className="text-emerald-700 font-medium truncate">{stat.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Submissions
            </h3>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {candidateApplications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No profile submissions yet</p>
                <p className="text-sm text-gray-400">
                  Submit your profile to jobs to see updates here
                </p>
              </div>
            ) : (
              candidateApplications
                .slice(0, 3)
                .map((application: Application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {application.job.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {application.job.company?.companyName ?? ""}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            application.status === "pending"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : application.status === "reviewed"
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : application.status === "accepted"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-red-50 text-red-800 border-red-200"
                          }`}
                        >
                          {getStatusLabel(application.status)}
                        </span>
                        {/* Extra badges disabled */}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Recommendations + match scores disabled */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentJobs.map((job: Job) => (
              <div key={job.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <h4 className="font-medium text-gray-900">{job.title}</h4>
                <p className="text-sm text-gray-600">{job.company?.companyName ?? ""}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {job.location} • {job.type}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status section disabled */}
    </div>
  );
};
