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

    const matchesType =
      typeFilter === "all"
        ? true
        : typeFilter === "remote"
          ? job.location.toLowerCase().includes("remote")
          : job.type === typeFilter;

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
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl border border-teal-100 shadow-md bg-gradient-to-r from-teal-50/80 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <h1 className="text-4xl font-serif font-bold text-teal-950 relative z-10">Find Opportunities</h1>
        <p className="text-teal-800/80 mt-2 font-medium text-lg relative z-10">
          Browse verified openings and submit your student profile
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-teal-600 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="Search jobs, organizations, or skills..."
              />
            </div>
            <div className="relative md:w-72 group">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-teal-600 transition-colors" />
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="Location..."
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3.5 border rounded-xl flex items-center justify-center space-x-2 font-semibold transition-all ${showFilters ? 'bg-teal-50 border-teal-200 text-teal-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="flex space-x-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-slate-50 text-slate-700 font-medium"
              >
                <option value="all">All Job Types</option>
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
      <div className="flex items-center justify-between px-2">
        <p className="text-slate-600 font-medium badge bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-sm">
          <span className="font-bold text-slate-900">{filteredJobs.length}</span> jobs found
        </p>
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <span className="font-medium mr-2">Sort by:</span>
          <button className="text-teal-700 font-bold hover:underline bg-teal-50 px-3 py-1 rounded-full">
            Relevance
          </button>
          <button className="text-slate-600 font-medium hover:text-teal-600 hover:bg-slate-100 px-3 py-1 rounded-full transition-colors">Date</button>
          <button className="text-slate-600 font-medium hover:text-teal-600 hover:bg-slate-100 px-3 py-1 rounded-full transition-colors">Salary</button>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-6">
        {filteredJobs.map((job: Job) => {
          const hasApplied = appliedJobIds.includes(job.id);

          return (
            <div
              key={job.id}
              className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:border-teal-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="flex-1 w-full">
                  <div className="flex items-start space-x-5">
                    <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center group-hover:border-teal-100 group-hover:shadow-md transition-all">
                      <Building2 className="w-8 h-8 text-slate-400 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold font-serif text-slate-900 group-hover:text-teal-800 transition-colors">
                          {job.title}
                        </h3>
                        {job.location.toLowerCase().includes('remote') && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-600 border border-indigo-100">Remote</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <h4 className="text-base font-bold text-slate-700 flex items-center gap-2">
                          {job.company?.companyName || "Company"}
                          {job.company?.verification?.status === "verified" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-200 text-[10px] font-bold text-emerald-800 uppercase tracking-wide shadow-sm">
                              <ShieldCheck className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 rounded-full border border-rose-200 text-[10px] font-bold text-rose-700 uppercase tracking-wide shadow-sm animate-pulse">
                              <ShieldCheck className="w-3.5 h-3.5" /> Scam Risk
                            </span>
                          )}
                        </h4>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 text-sm font-medium">
                          {job.company?.industry || "Technology"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 mb-6">
                        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-700">{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-700">
                            ${job.salary.min.toLocaleString()} - $
                            {job.salary.max.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          <span className="capitalize font-medium text-slate-700">
                            {job.type.replace("-", " ")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>
                            Posted {new Date(job.postedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-600 mb-6 line-clamp-2 leading-relaxed text-sm">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {(job.skills || []).map((skill: string) => (
                          <span
                            key={skill}
                            className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center gap-3 w-full md:w-auto md:min-w-[160px] pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 md:pl-6 md:border-l">
                  {hasApplied ? (
                    <div className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 cursor-default shadow-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-bold uppercase tracking-wide">Submitted</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApply(job)}
                      className="w-full px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-sm tracking-wide"
                    >
                      Submit Profile
                    </button>
                  )}

                  <div className="flex gap-2 w-full">
                    <button className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm font-medium">
                      Save
                    </button>

                    <button className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm font-medium">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">
              No jobs available right now
            </h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Try adjusting your search criteria or location filters to find more opportunities.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setLocationFilter("");
                setTypeFilter("all");
              }}
              className="px-6 py-2.5 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-800 rounded-lg font-bold transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
