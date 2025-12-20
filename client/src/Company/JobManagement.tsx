import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Company } from "../types";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Plus,
  Edit,
  Eye,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Briefcase,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useGlobalContext } from "@/Context/useGlobalContext";
import { contractAbi } from "@/lib/contractAbi";
import type { Hex } from "viem";
import { flowTestnet } from "viem/chains";

// Mock data
const mockCompany: Company = {
  id: "1",
  email: "company@techinnovators.com",
  name: "Tech Innovators Inc",
  type: "company",
  createdAt: "2015-01-01",
  companyName: "Tech Innovators Inc",
  industry: "Technology",
  size: "100-500",
  description: "Leading software development company",
  website: "https://www.techinnovators.com",
  logo: "",
};

// mockJobs unused (jobs are loaded from the contract)

const mockApplications = [
  { id: "1", jobId: "1" },
  { id: "2", jobId: "1" },
  { id: "3", jobId: "1" },
];

const jobTypeMapping: Record<string, bigint> = {
  "full-time": BigInt(0),
  "part-time": BigInt(1),
  contract: BigInt(2),
  internship: BigInt(3),
  freelance: BigInt(4),
};

const locationTypeMapping: Record<string, bigint> = {
  Remote: BigInt(0),
  Hybrid: BigInt(1),
  Onsite: BigInt(2),
};

// Form validation schema
const jobFormSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.string().optional(),
  skills: z.string().optional(),
  location: z.enum(["Remote", "Hybrid", "Onsite"]),
  type: z.enum([
    "full-time",
    "part-time",
    "contract",
    "internship",
    "freelance",
  ]),
  salaryMin: z.string().refine((val) => !val || !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
  salaryMax: z.string().refine((val) => !val || !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
  status: z.enum(["active", "closed", "draft"]),
});

type JobFormData = z.infer<typeof jobFormSchema>;

export const JobManagement: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const {
    jobWalletClient,
    contractAddress,
    jobPublicClient,
    job: companyJobs,
  } = useGlobalContext();
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

  const company = mockCompany;
  // const companyJobs = mockJobs;
  const applications = mockApplications;

  const onSubmit = (data: JobFormData) => {
    if (!jobWalletClient) return;
    if (!jobPublicClient) return;

    const jobId = uuidv4();

    console.log("Submitting job:", jobId, data);

    (async function () {
      const [account] = await jobWalletClient.getAddresses();
      const tx = await jobWalletClient.writeContract({
        address: contractAddress as Hex,
        abi: contractAbi,
        functionName: "postJob",
        args: [
          jobId,
          company.id,
          data.title,
          data.description,
          [data.requirements],
          [data.skills],
          locationTypeMapping[data.location], // Use the mapping here
          [data.salaryMin, data.salaryMax],
          jobTypeMapping[data.type],
        ],
        account,
        chain: flowTestnet,
      });

      await jobPublicClient.waitForTransactionReceipt({
        hash: tx,
      });


      //      {
      //   id: "2",
      //   companyId: "1",
      //   company: mockCompany,
      //   title: "Backend Engineer",
      //   description:
      //     "Join our engineering team to build scalable backend services.",
      //   requirements: [
      //     "3+ years backend experience",
      //     "Python or Node.js",
      //     "SQL/NoSQL databases",
      //   ],
      //   skills: ["Python", "Node.js", "PostgreSQL", "APIs"],
      //   location: "Remote",
      //   type: "full-time",
      //   salary: { min: 150000, max: 220000, currency: "USD" },
      //   postedAt: "2024-01-10",
      //   status: "active",
      // },

      console.log("Job posted on-chain with tx:", tx);
    })();
  };

  const getApplicationCount = (jobId: string) =>
    applications.filter((app) => app.jobId === jobId).length;

  return (
    <div className="w-full p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Listings</h1>
          <p className="text-gray-600 mt-2">Create and manage job listings</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Job Listing
        </button>
      </div>

      {/* Create Job Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Job Listing</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a job listing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Title & Location */}
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
                {/* <Input
                  type="text"
                  {...form.register("location")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                /> */}

                <Select {...form.register("location")}>
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

            {/* Description */}
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

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements (one per line)
              </label>
              <textarea
                {...form.register("requirements")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="5+ years experience&#10;Bachelor's degree&#10;Strong communication skills"
              />
            </div>

            {/* Skills */}
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

            {/* Type & Salary */}
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
                  <option value="remote">Remote</option>
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

            {/* Actions */}
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
                disabled={form.formState.isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {form.formState.isSubmitting ? "Creating..." : "Create Listing"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Jobs List */}
      <div className="space-y-6">
        {companyJobs && companyJobs.length === 0 ? (
          <div
            className="text-center py-16 border border-dashed border-gray-300 rounded-lg"
            key={0}
          >
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No jobs posted yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first job listing
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Create Your First Job Listing
            </button>
          </div>
        ) : (
          companyJobs &&
          companyJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Left */}
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
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />$
                      {job.salary.min.toLocaleString()} - $
                      {job.salary.max.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(job.postedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {getApplicationCount(job.id)} submissions
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {job.skills &&
                      job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-start">
                  <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
