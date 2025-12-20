import type { Application, Company, Job } from "@/types";
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
      description: "Leading software development company",
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
      description: "Leading software development company",
    } as Company,
    title: "Backend Engineer",
    description:
      "Join our engineering team to build scalable backend services.",
    requirements: [
      "3+ years backend experience",
      "Python or Node.js",
      "SQL/NoSQL databases",
    ],
    skills: ["Python", "Node.js", "PostgreSQL", "APIs"],
    location: "Remote",
    type: "full-time",
    salary: { min: 150000, max: 220000, currency: "USD" },
    postedAt: "2024-01-10",
    status: "active",
  },
];

const company: Company = {
  id: "1",
  email: "company@demo.com",
  name: "Tech Innovators Inc",
  type: "company",
  createdAt: "2024-01-01",
  companyName: "Tech Innovators Inc",
  industry: "Technology",
  size: "100-500",
  description: "Leading software development company",
};

const applications: Application[] = [];

export const CompanyOverview: React.FC = () => {
  const companyJobs = jobs.filter((job) => job.companyId === company.id);
  const totalApplications = applications.filter((app) =>
    companyJobs.some((job) => job.id === app.jobId)
  );

  const getSubmissionStatusLabel = (status: Application["status"]) => {
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
      label: "Total Submissions",
      value: totalApplications.length,
      icon: Users,
      color: "bg-green-500",
      trend: "+8%",
    },
    {
      label: "Under Review",
      value: pendingApplications.length,
      icon: Clock,
      color: "bg-yellow-500",
      trend: "+3%",
    },
    {
      label: "Verified",
      value: acceptedApplications.length,
      icon: UserCheck,
      color: "bg-purple-500",
      trend: "+15%",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-6 bg-gradient-to-r from-blue-50 via-white to-amber-50">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Welcome back, Tech Innovators Inc
          </h1>
          <p className="text-slate-600 mt-1">
            Here's what's happening in your review queue today.
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
                <span className="text-emerald-700 font-medium">{stat.trend}</span>
                <span className="text-slate-500 ml-1">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {companyJobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl"
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

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Submissions
            </h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {totalApplications.slice(0, 3).map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl"
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
                    {getSubmissionStatusLabel(application.status)}
                  </span>
                  {/* Compatibility UI disabled */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
