import React, { useEffect, useMemo, useState } from "react";
import type { Candidate } from "../types";
import {
  Search,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  Filter,
  Building2,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";

// Mock candidate data
// Will be replaced with real candidate data in Phase 3 Part-2
const temporaryCandidate: Candidate = {
  id: "temp_candidate",
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

const getCompatibilityScore = (job: any, candidate: any): number => {
  const jobSkills = (job.skills || []).map((s: string) => String(s).toLowerCase());
  const candidateSkills = (candidate?.skills || []).map((s: string) => String(s).toLowerCase());

  if (jobSkills.length === 0) return 50;

  const overlap = jobSkills.filter((skill: string) => candidateSkills.includes(skill)).length;
  const score = Math.min(95, Math.max(20, (overlap / jobSkills.length) * 100));
  return Math.round(score);
};

export const JobSearch: React.FC = () => {
  const authInstance = useMemo(() => getAuth(app), []);
  const db = useMemo(() => getFirestore(), []);

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<any>(temporaryCandidate);
  const [candidateVerified, setCandidateVerified] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(authInstance, async (user) => {
      try {
        setError(null);
        setLoading(true);

        // Load candidate profile and verification status
        if (user) {
          const candidateRef = doc(db, "users", user.uid);
          const candidateSnap = await getDoc(candidateRef);
          if (candidateSnap.exists()) {
            const candidateData = candidateSnap.data();
            setCandidate(candidateData);
            setCandidateVerified(Boolean(candidateData?.verified));
          }
        }

        // Load active jobs
        const qJobs = query(collection(db, "jobs"), where("status", "==", "active"));
        const snap = await getDocs(qJobs);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setJobs(list);
      } catch (e) {
        console.error(e);
        setError("Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [db, authInstance]);

  const filteredJobs = jobs.filter((job) => {
    const title = String(job.title || "").toLowerCase();
    const description = String(job.description || "").toLowerCase();
    const companyName = String(job.companySnapshot?.name || "").toLowerCase();

    const matchesSearch =
      title.includes(searchTerm.toLowerCase()) ||
      description.includes(searchTerm.toLowerCase()) ||
      companyName.includes(searchTerm.toLowerCase());

    const matchesLocation =
      !locationFilter ||
      String(job.location || "")
        .toLowerCase()
        .includes(locationFilter.toLowerCase());

    const matchesType = typeFilter === "all" || job.type === typeFilter;

    return matchesSearch && matchesLocation && matchesType;
  });

  const handleApply = async (job: any) => {
    try {
      setError(null);
      const user = auth.currentUser;
      if (!user) {
        setError("You must be signed in to apply.");
        return;
      }

      if (!candidateVerified) {
        setError("You must verify your profile before applying. Visit your profile to get verified.");
        return;
      }

      if (appliedJobIds.includes(job.id)) return;

      setApplyingJobId(job.id);

      const applicationId = uuidv4();

      const payload = {
        id: applicationId,
        candidateId: user.uid,
        companyId: job.companyId,
        jobId: job.id,
        appliedAt: new Date().toISOString(),
        status: "pending" as const,
        candidateSnapshot: {
          id: user.uid,
          email: user.email || candidate.email,
          name: user.displayName || candidate.name,
          ...candidate,
        },
        jobSnapshot: {
          id: job.id,
          companyId: job.companyId,
          title: job.title,
          location: job.location,
          type: job.type,
          companySnapshot: job.companySnapshot || null,
          salary: job.salary || null,
        },
      };

      await setDoc(doc(db, "applications", applicationId), payload);

      setAppliedJobIds((prev) => [...prev, job.id]);
    } catch (e) {
      console.error(e);
      setError("Failed to apply. Please try again.");
    } finally {
      setApplyingJobId(null);
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Your Next Opportunity</h1>
        <p className="text-gray-600 mt-1">Discover jobs that match your skills and preferences</p>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

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
                placeholder="Search jobs, companies, or skills..."
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
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-gray-600">{filteredJobs.length} jobs found</p>
      </div>

      <div className="space-y-4">
        {filteredJobs.map((job) => {
          const compatibilityScore = getCompatibilityScore(job, candidate);
          const hasApplied = appliedJobIds.includes(job.id);
          const isVerifiedCompany = Boolean(job.companySnapshot?.verified);

          return (
            <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4" />
                          <span className="text-sm font-medium">{compatibilityScore}% match</span>
                        </div>
                        {isVerifiedCompany ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                            Verified Company
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        <h4 className="text-lg font-medium text-gray-700">
                          {job.companySnapshot?.name || "Company"}
                        </h4>
                        {job.companySnapshot?.industry ? (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">{job.companySnapshot.industry}</span>
                          </>
                        ) : null}
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        {job.salary?.min != null && job.salary?.max != null ? (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>
                              ${Number(job.salary.min).toLocaleString()} - ${Number(job.salary.max).toLocaleString()}
                            </span>
                          </div>
                        ) : null}
                        <div className="flex items-center space-x-1">
                          <Briefcase className="w-4 h-4" />
                          <span className="capitalize">{String(job.type || "").replace("-", " ")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(job.postedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {(job.skills || []).map((skill: string) => (
                          <span
                            key={skill}
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              (candidate.skills || []).includes(skill)
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-3">
                  {hasApplied ? (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Applied</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApply(job)}
                      disabled={applyingJobId === job.id}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-semibold disabled:opacity-50"
                    >
                      {applyingJobId === job.id ? "Applying..." : "Apply Now"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or location filters</p>
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
