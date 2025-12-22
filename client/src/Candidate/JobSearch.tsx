import React, { useState } from "react";
import type {
  Job,
} from "../types";
import {
  Search,
  MapPin,
  DollarSign,
  Calendar,
  Filter,
  Building2,
  Briefcase,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { useGlobalContext } from "@/Context/useGlobalContext";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";

export const JobSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const {
    user,
    allJobs,
    myApplication
  } = useGlobalContext();

  const appliedJobIds = (myApplication || []).map((app) => app.jobId);

  // Filter jobs based on search terms
  const filteredJobs = (allJobs || []).filter((job: Job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.company?.companyName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesLocation =
      !locationFilter ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesType = typeFilter === "all" || job.type === typeFilter;

    return matchesSearch && matchesLocation && matchesType;
  });

  const handleApply = async (job: Job) => {
    if (!user) {
      alert("Please sign in to apply.");
      return;
    }
    if (user.type !== "candidate") {
      alert("Only candidates can apply to jobs.");
      return;
    }

    const db = getFirestore(app);
    try {
      const applicationId = uuidv4();

      // SINGLE SOURCE OF TRUTH: The Recruiter's Auth ID (job.company.id).
      // We DO NOT trust the denormalized string 'companyId' as it may be stale or inconsistent.
      // If job.company object is missing, the application cannot be correctly routed.
      const targetCompanyId = job.company?.id;

      console.log("JobSearch: APPLICATION WRITE companyId:", targetCompanyId, "source: job.company.id");

      if (!targetCompanyId) {
        console.error("Critical Data Error: Job is missing denormalized 'company' object or ID.", job);
        alert("Cannot apply: The job posting data is incomplete (missing Employer ID). Please contact support.");
        return;
      }

      await addDoc(collection(db, "applications"), {
        id: applicationId, // Store ID inside doc as well if needed, or rely on doc.id
        jobId: job.id,
        candidateId: user.id,
        companyId: targetCompanyId, // Explicitly set resolved companyId
        status: "pending",
        appliedAt: new Date().toISOString(),
        // Store snapshot of job/candidate for easier display without joins
        job: job,
        candidate: {
          candidateId: user.id,
          name: user.name,
          email: user.email,
          // Add other candidate fields if available in user profile
          // For now, minimal data is better than mock data
        }
      });
      console.log("Applied to job:", job.id);
    } catch (error) {
      console.error("Error applying to job:", error);
      alert("Failed to apply. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
        <p className="text-gray-600 mt-1">
          Browse openings and submit your verified profile
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search jobs, organizations, or skills..."
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-64 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Location..."
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">{filteredJobs.length} jobs found</p>
        <div className="flex space-x-2 text-sm text-gray-600">
          <span>Sort by:</span>
          <button className="text-blue-600 hover:text-blue-700">
            Relevance
          </button>
          <span>•</span>
          <button className="text-gray-600 hover:text-blue-600">Date</button>
          <span>•</span>
          <button className="text-gray-600 hover:text-blue-600">Salary</button>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.map((job: Job) => {
          const hasApplied = appliedJobIds.includes(job.id);

          return (
            <div
              key={job.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {job.title}
                        </h3>
                        {/* Match % disabled */}
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        <h4 className="text-lg font-medium text-gray-700 flex items-center gap-1">
                          {job.company?.companyName || "Company"}
                          {job.company?.verification?.status === "verified" && (
                            <ShieldCheck className="w-4 h-4 text-blue-600" aria-label="Verified Company" />
                          )}
                        </h4>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          {job.company?.industry || "Technology"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            ${job.salary.min.toLocaleString()} - $
                            {job.salary.max.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="w-4 h-4" />
                          <span className="capitalize">
                            {job.type.replace("-", " ")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(job.postedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {(job.skills || []).map((skill: string) => (
                          <span
                            key={skill}
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              //   (candidate.skills ?? []).includes(skill)
                              //     ? "bg-green-100 text-green-800"
                              //     : 
                              "bg-gray-100 text-gray-700"
                              }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Compatibility analysis disabled */}
                    </div>
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-3">
                  {hasApplied ? (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Submitted</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApply(job)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-semibold"
                    >
                      Submit Profile
                    </button>
                  )}

                  <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Save Job
                  </button>

                  <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No jobs available right now
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or location filters
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setLocationFilter("");
                setTypeFilter("all");
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
