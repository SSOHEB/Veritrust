import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Plus, MapPin, DollarSign, Calendar, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { auth } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";

const jobFormSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.string().optional(),
  skills: z.string().optional(),
  location: z.enum(["Remote", "Hybrid", "Onsite"]),
  type: z.enum(["full-time", "part-time", "contract", "internship", "freelance"]),
  salaryMin: z.string().refine((val) => !val || !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
  salaryMax: z.string().refine((val) => !val || !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
  status: z.enum(["active", "closed"]),
});

type JobFormData = z.infer<typeof jobFormSchema>;

export const JobManagement: React.FC = () => {
  const db = useMemo(() => getFirestore(), []);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyVerified, setCompanyVerified] = useState<boolean>(false);
  const [companySnapshot, setCompanySnapshot] = useState<any | null>(null);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      skills: "",
      location: "Onsite",
      type: "full-time",
      salaryMin: "",
      salaryMax: "",
      status: "active",
    },
  });

  useEffect(() => {
    const run = async () => {
      try {
        setError(null);
        setLoading(true);

        const user = auth.currentUser;
        if (!user) {
          setJobs([]);
          setCompanyVerified(false);
          setCompanySnapshot(null);
          setError("You must be signed in to manage jobs.");
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};
        const verified = Boolean((userData as any)?.verified);

        setCompanyVerified(verified);
        setCompanySnapshot({
          name: (userData as any)?.companyName || user.displayName || "Company",
          industry: (userData as any)?.industry || "",
          logo: (userData as any)?.logo || "",
          verified,
        });

        const qJobs = query(
          collection(db, "jobs"),
          where("companyId", "==", user.uid),
          orderBy("postedAt", "desc")
        );

        const snap = await getDocs(qJobs);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setJobs(list);
      } catch (e) {
        console.error(e);
        setError("Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [db]);

  const parseLines = (value?: string) =>
    (value || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  const parseCsv = (value?: string) =>
    (value || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const onSubmit = async (data: JobFormData) => {
    try {
      setError(null);
      setSubmitting(true);

      const user = auth.currentUser;
      if (!user) {
        setError("You must be signed in to post a job.");
        return;
      }

      if (!companyVerified) {
        setError("Your company must be verified before posting jobs.");
        return;
      }

      const jobId = uuidv4();

      const newJob = {
        id: jobId,
        companyId: user.uid,
        title: data.title,
        description: data.description,
        requirements: parseLines(data.requirements),
        skills: parseCsv(data.skills),
        location: data.location,
        type: data.type,
        salary: {
          min: Number(data.salaryMin || 0),
          max: Number(data.salaryMax || 0),
          currency: "USD",
        },
        postedAt: new Date().toISOString(),
        status: data.status,
        immutable: true,
        companySnapshot: companySnapshot || {
          name: user.displayName || "Company",
          industry: "",
          logo: "",
          verified: true,
        },
      };

      await setDoc(doc(db, "jobs", jobId), newJob);

      setJobs((prev) => [newJob, ...prev]);
      setShowCreateForm(false);
      form.reset();
    } catch (e) {
      console.error(e);
      setError("Failed to create job.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-1">
        <div className="text-gray-600">Loading…</div>
      </div>
    );
  }

  return (
    <div className="w-full p-1">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-2">Create jobs (immutable) for candidates</p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          disabled={!companyVerified}
          className={`mt-4 md:mt-0 px-5 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            companyVerified
              ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </button>
      </div>

      {!companyVerified ? (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
          Job posting is disabled until your company is verified.
        </div>
      ) : null}

      {error ? <div className="mb-6 text-sm text-red-600">{error}</div> : null}

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Job</DialogTitle>
            <DialogDescription>
              Jobs are immutable once created. Editing is not supported.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <Input
                  type="text"
                  {...form.register("title")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="h-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>

                <Select
                  value={form.watch("location")}
                  onValueChange={(v) => form.setValue("location", v as any)}
                >
                  <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Onsite">Onsite</SelectItem>
                  </SelectContent>
                </Select>

                {form.formState.errors.location && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.location.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <textarea
                {...form.register("description")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {form.formState.errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements (one per line)
              </label>
              <textarea
                {...form.register("requirements")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills (comma separated)
              </label>
              <Input
                type="text"
                {...form.register("skills")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="React, TypeScript, Node.js"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select
                  {...form.register("type")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Salary ($)
                </label>
                <Input
                  type="number"
                  {...form.register("salaryMin")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Salary ($)
                </label>
                <Input
                  type="number"
                  {...form.register("salaryMax")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !companyVerified}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Job"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {jobs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-300 rounded-lg">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No jobs posted yet
            </h3>
            <p className="text-gray-600 mb-6">
              {companyVerified
                ? "Start by creating your first immutable job listing"
                : "Verify your company to start posting jobs"}
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              disabled={!companyVerified}
              className={`px-6 py-3 rounded-lg font-semibold ${
                companyVerified
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        job.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {job.status}
                    </span>
                    {job.immutable ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        Immutable
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />$
                      {Number(job.salary?.min || 0).toLocaleString()} - $
                      {Number(job.salary?.max || 0).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(job.postedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {(job.skills || []).map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
