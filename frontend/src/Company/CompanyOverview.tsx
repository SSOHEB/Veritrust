import type { Application, Candidate, Company, Job } from "@/types";
import {
  Briefcase,
  Users,
  TrendingUp,
  Clock,
  Eye,
  UserCheck,
} from "lucide-react";

// Mock data
const jobs: Job[] = [
  {
    id: "1",
    companyId: "1",
    company: {
      id: "1",
      email: "company@demo.com",
      name: "Tech Innovators Inc",
      type: "company",
      createdAt: "2024-01-01",
      companyName: "Tech Innovators Inc",
      industry: "Technology",
      size: "100-500",
      description: "Leading AI and software development company",
    } as Company,
    title: "Senior Frontend Developer",
    description:
      "We are looking for a skilled Frontend Developer to join our team and help build next-generation web applications.",
    requirements: [
      "5+ years React experience",
      "TypeScript proficiency",
      "UI/UX design skills",
    ],
    skills: ["React", "TypeScript", "JavaScript", "CSS", "HTML"],
    location: "San Francisco, CA",
    type: "full-time",
    salary: { min: 120000, max: 180000, currency: "USD" },
    postedAt: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    companyId: "1",
    company: {
      id: "1",
      email: "company@demo.com",
      name: "Tech Innovators Inc",
      type: "company",
      createdAt: "2024-01-01",
      companyName: "Tech Innovators Inc",
      industry: "Technology",
      size: "100-500",
      description: "Leading AI and software development company",
    } as Company,
    title: "AI/ML Engineer",
    description:
      "Join our AI team to develop cutting-edge machine learning models and AI-powered solutions.",
    requirements: [
      "PhD or Masters in AI/ML",
      "Python expertise",
      "Deep Learning frameworks",
    ],
    skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "AI"],
    location: "Remote",
    type: "full-time",
    salary: { min: 150000, max: 220000, currency: "USD" },
    postedAt: "2024-01-10",
    status: "active",
  },
];

const company = {
  id: "2",
  email: "candidate@demo.com",
  name: "John Developer",
  type: "candidate",
  createdAt: "2024-01-01",
  title: "Senior Frontend Developer",
  experience: 5,
  skills: ["React", "TypeScript", "Node.js", "Python"],
  location: "San Francisco, CA",
  bio: "Passionate full-stack developer with 5+ years of experience",
  education: "BS Computer Science",
  phone: "+1-555-0123",
} as Candidate;

const applications: Application[] = [];

export const CompanyOverview: React.FC = () => {
  const companyJobs = jobs.filter((job) => job.companyId === company.id);
  const totalApplications = applications.filter((app) =>
    companyJobs.some((job) => job.id === app.jobId)
  );
  const pendingApplications = totalApplications.filter(
    (app) => app.status === "pending"
  );
  const acceptedApplications = totalApplications.filter(
    (app) => app.status !== "pending" && app.status !== "rejected"
  );

  const stats = [
    {
      label: "Active Jobs",
      value: companyJobs.filter((job) => job.status === "active").length,
      icon: Briefcase,
      color: "bg-blue-500",
      trend: "+12%",
    },
    {
      label: "Total Applications",
      value: totalApplications.length,
      icon: Users,
      color: "bg-green-500",
      trend: "+8%",
    },
    {
      label: "Pending Review",
      value: pendingApplications.length,
      icon: Clock,
      color: "bg-yellow-500",
      trend: "+3%",
    },
    {
      label: "In Process",
      value: acceptedApplications.length,
      icon: UserCheck,
      color: "bg-purple-500",
      trend: "+15%",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, Tech Innovators Inc
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your hiring pipeline today.
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
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {companyJobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-500">
                    {job.location} • {job.type}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    job.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Applications
            </h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {totalApplications.slice(0, 3).map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900">
                    {application.candidate.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {application.job.title}
                  </p>
                </div>
                <div className="text-right">
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
                  {application.compatibilityScore && (
                    <p className="text-xs text-gray-500 mt-1">
                      {application.compatibilityScore}% match
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
