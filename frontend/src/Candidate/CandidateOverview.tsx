import React, { useEffect } from "react";
import type { Candidate, Application, Job, Company } from "../types";
import {
  FileText,
  Bot,
  TrendingUp,
  Eye,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";

// Mock candidate data
const mockCandidate: Candidate = {
  id: "2",
  email: "john.developer@example.com",
  name: "John Developer",
  type: "candidate",
  createdAt: "2024-01-01",
  title: "Senior Frontend Developer",
  experience: 5,
  skills: ["React", "TypeScript", "Node.js", "JavaScript"],
  location: "San Francisco, CA",
  bio: "Passionate developer with 5+ years of experience",
  education: "BS Computer Science",
  phone: "+1-555-0123",
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
        description: "Leading AI and software development company",
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
    compatibilityScore: 85,
    aiApplied: false,
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
        name: "AI Startup",
        companyName: "AI Startup",
        industry: "Technology",
        size: "50-100",
        description: "Cutting-edge AI company",
      } as Company,
      title: "ML Engineer",
      description: "Machine learning engineer position",
      requirements: ["Python", "TensorFlow", "3+ years experience"],
      skills: ["Python", "TensorFlow", "Machine Learning"],
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
    status: "interview_scheduled",
    appliedAt: "2024-01-14",
    compatibilityScore: 78,
    aiApplied: true,
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

  const navigate = useNavigate();

  const candidateApplications = mockApplications.filter(
    (app: Application) => app.candidateId === candidate.id
  );
  const pendingApplications = candidateApplications.filter(
    (app: Application) => app.status === "pending"
  );
  const acceptedApplications = candidateApplications.filter(
    (app: Application) => app.status !== "pending" && app.status !== "rejected"
  );
  const aiApplications = candidateApplications.filter(
    (app: Application) => app.aiApplied
  );

  const { ready, user } = usePrivy();
  const stats = [
    {
      label: "Applications Sent",
      value: candidateApplications.length,
      icon: FileText,
      color: "bg-blue-500",
      trend: "+5 this week",
    },
    {
      label: "Pending Review",
      value: pendingApplications.length,
      icon: Clock,
      color: "bg-yellow-500",
      trend: "Awaiting response",
    },
    {
      label: "In Process",
      value: acceptedApplications.length,
      icon: CheckCircle,
      color: "bg-green-500",
      trend: "+2 interviews",
    },
    {
      label: "AI Applications",
      value: aiApplications.length,
      icon: Bot,
      color: "bg-purple-500",
      trend: "Auto-applied",
    },
  ];

  const recentJobs = mockJobs.slice(0, 4);

  useEffect(() => {
    if (ready) {
      if (!user) navigate("/");
    }
  }, [ready, user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {candidate.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Track your applications and discover new opportunities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">{stat.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Applications
            </h3>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {candidateApplications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No applications yet</p>
                <p className="text-sm text-gray-400">
                  Start applying to jobs to see them here
                </p>
              </div>
            ) : (
              candidateApplications
                .slice(0, 3)
                .map((application: Application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {application.job.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {application.job.company.companyName}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            application.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : application.status === "application_accepted"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {application.status.replace("_", " ")}
                        </span>
                        {application.aiApplied && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            AI Applied
                          </span>
                        )}
                      </div>
                    </div>
                    {application.compatibilityScore && (
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {application.compatibilityScore}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">match</p>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recommended Jobs
            </h3>
            <Bot className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentJobs.map((job: Job) => (
              <div key={job.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-600">
                      {job.company.companyName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.location} • {job.type}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.skills.slice(0, 3).map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="flex items-center space-x-1 mb-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900">
                        92%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">match</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Agent Status */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                AI Job Agent
              </h3>
              <p className="text-gray-600">
                Your AI agent has automatically applied to{" "}
                {aiApplications.length} jobs this week
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
