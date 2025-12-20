import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Company } from "@/types";
import {
  Building2,
  Globe,
  Users,
  Star,
  Edit,
  Upload,
  Save,
  X,
} from "lucide-react";
import { useGlobalContext } from "@/Context/useGlobalContext";
import { type Hex } from "viem";
import { contractAbi } from "@/lib/contractAbi";
import { usePrivy } from "@privy-io/react-auth";
import { flowTestnet } from "viem/chains";

// Form validation schema
const companyFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  size: z.string().min(1, "Company size is required"),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

// Mock company data
const mockCompany: Company = {
  id: "1",
  email: "company@techinnovators.com",
  name: "Tech Innovators Inc",
  type: "company",
  createdAt: "2015-01-01",
  companyName: "Tech Innovators Inc",
  industry: "Technology",
  size: "100-500",
  description:
    "Leading AI and software development company specializing in innovative solutions for modern businesses. We focus on cutting-edge technology and exceptional user experiences.",
  website: "https://www.techinnovators.com",
  logo: "",
};

const CompanyInfo: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState<Company>(mockCompany);
  const { jobPublicClient, jobWalletClient, contractAddress } =
    useGlobalContext();
  const { user, ready } = usePrivy();

  useEffect(() => {
    if (!jobPublicClient) return;
    if (!user) return;
    (async function () {
      const companyDetails = await jobPublicClient.readContract({
        address: contractAddress as Hex,
        abi: contractAbi,
        functionName: "getCompany",
        args: [user.id],
      });
      console.log("Company details from contract:", companyDetails);

      setCompany({
        id: companyDetails.companyId,
        email: companyDetails.contacts[0] || "",
        name: companyDetails.name || "",
        type: "company",
        createdAt: user.createdAt.toISOString().split("T")[0], // parse Date object to 2015-01-01
        companyName: companyDetails?.name || "",
        industry: companyDetails?.details[0] || "",
        size: companyDetails?.details[1] || "",
        description: companyDetails?.description || "",
        website: companyDetails?.misc[2] || "",
        logo: "",
      });
    })();
  }, [jobPublicClient, user]);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: company.companyName,
      industry: company.industry,
      description: company.description,
      size: company.size,
      website: company.website || "",
    },
  });

  // Mock data for company rating and additional info
  const companyRating = 4.6;

  const onSubmit = (data: CompanyFormData) => {
    if (!jobWalletClient) return;
    if (!jobPublicClient) return;
    if (!ready) return;
    if (!user) return;
    console.log("Saving company data:", data);
    console.log("Saving company data with args:", [
      user.id, // string
      "", // string (image)
      user?.google?.name || "", // string
      [user?.google?.email || ""], // string[]
      data.description, // ✅ ensure string
      [String(data.industry), String(data.size), String(data.website)], // string[]
      String(companyRating), // ✅ ensure string
    ]);
    (async function () {
      try {
        const [account] = await jobWalletClient.getAddresses();
        const tx = await jobWalletClient.writeContract({
          address: contractAddress as Hex,
          abi: contractAbi,
          functionName: "registerCompany",
          args: [
            user.id, // string
            "", // string (image)
            user?.google?.name || "", // string
            [user?.google?.email || ""], // string[]
            data.description, // ✅ ensure string
            [String(data.industry), String(data.size), String(data.website)], // string[]
            String(companyRating), // ✅ ensure string
          ],
          account,
          chain: flowTestnet,
        });

        await jobPublicClient.waitForTransactionReceipt({
          hash: tx,
        });

        const companyDetails = await jobPublicClient.readContract({
          address: contractAddress as Hex,
          abi: contractAbi,
          functionName: "getCompany",
          args: [user.id],
          account: account,
        });
        console.log("Company details from contract:", companyDetails);

        //         const mockCompany: Company = {
        //   id: "1",
        //   email: "company@techinnovators.com",
        //   name: "Tech Innovators Inc",
        //   type: "company",
        //   createdAt: "2015-01-01",
        //   companyName: "Tech Innovators Inc",
        //   industry: "Technology",
        //   size: "100-500",
        //   description:
        //     "Leading AI and software development company specializing in innovative solutions for modern businesses. We focus on cutting-edge technology and exceptional user experiences.",
        //   website: "https://www.techinnovators.com",
        //   logo: "",
        // };
        setCompany({
          id: user.id,
          email: user.google?.email || "",
          name: user.google?.name || "",
          type: "company",
          createdAt: user.createdAt.toISOString().split("T")[0], // parse Date object to 2015-01-01
          companyName: data.companyName,
          industry: data.industry,
          size: data.size,
          description: data.description,
          website: data.website,
          logo: "",
        });
      } catch (error) {
        console.error("Error saving company data:", error);
      }
    })();
    setIsEditing(false);
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  return (
    <div className="p-2 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground">
            Manage your company information and details
          </p>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit className="size-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-3">
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={form.formState.isSubmitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Save className="size-4" />
              {form.formState.isSubmitting ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="size-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Company Header Card */}
      <Card>
        <CardContent className="lg:p-6">
          <div className="lg:items-start items-center gap-6 flex lg:flex-row flex-col">
            {/* Company Logo */}
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.companyName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                company.companyName
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  {isEditing ? (
                    <div className="space-y-3 flex flex-col">
                      <input
                        type="text"
                        {...form.register("companyName")}
                        className="text-xl font-semibold bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none w-fit"
                        placeholder="Company Name"
                      />
                      {form.formState.errors.companyName && (
                        <p className="text-red-500 text-xs">
                          {form.formState.errors.companyName.message}
                        </p>
                      )}
                      <input
                        type="text"
                        {...form.register("industry")}
                        className="text-muted-foreground bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-fit"
                        placeholder="Industry"
                      />
                      {form.formState.errors.industry && (
                        <p className="text-red-500 text-xs">
                          {form.formState.errors.industry.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-semibold">
                        {company.companyName}
                      </h2>
                      <p className="text-muted-foreground mb-2">
                        {company.industry}
                      </p>
                    </div>
                  )}
                  <div className="flex lg:items-center lg:flex-row gap-4 text-sm text-muted-foreground mt-5 flex-col">
                    <div className="flex items-center gap-1">
                      <Globe className="size-4" />
                      {isEditing ? (
                        <input
                          type="url"
                          {...form.register("website")}
                          className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-sm w-fit"
                          placeholder="Company website"
                        />
                      ) : (
                        company.website || "No website"
                      )}
                      {form.formState.errors.website && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.website.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="size-4" />
                      {isEditing ? (
                        <input
                          type="text"
                          {...form.register("size")}
                          className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-sm"
                          placeholder="Company size"
                        />
                      ) : (
                        `${company.size} employees`
                      )}
                      {form.formState.errors.size && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.size.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="size-5 fill-current" />
                    <span className="text-xl font-semibold text-foreground">
                      {companyRating}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Company Rating
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Company Description
              </label>
              {isEditing ? (
                <textarea
                  {...form.register("description")}
                  rows={4}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your company..."
                />
              ) : (
                <p className="mt-1">{company.description}</p>
              )}
              {form.formState.errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Company Size
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    {...form.register("size")}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 10-50, 100-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="size-4" />
                    <span>{company.size} employees</span>
                  </div>
                )}
                {form.formState.errors.size && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.size.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Industry
              </label>
              {isEditing ? (
                <input
                  type="text"
                  {...form.register("industry")}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              ) : (
                <p className="mt-1">{company.industry}</p>
              )}
              {form.formState.errors.industry && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.industry.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  {...form.register("website")}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.company.com"
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <Globe className="size-4" />
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">
                      No website provided
                    </span>
                  )}
                </div>
              )}
              {form.formState.errors.website && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.website.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company Performance & Culture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="size-5" />
              Company Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Overall Rating
              </label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`size-4 ${
                        star <= Math.floor(companyRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{companyRating}/5.0</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Work-Life Balance</span>
                  <span>4.5/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "90%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span>Career Growth</span>
                  <span>4.3/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "86%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span>Company Culture</span>
                  <span>4.8/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "96%" }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Resources & Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            Company Resources & Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Company Profile</h4>
              <p className="text-sm text-muted-foreground">
                Last updated: 2 days ago
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Download PDF
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Company Handbook</h4>
              <p className="text-sm text-muted-foreground">
                Available for candidates
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Handbook
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Benefits Package</h4>
              <p className="text-sm text-muted-foreground">
                5 benefits outlined
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Manage Benefits
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyInfo;
