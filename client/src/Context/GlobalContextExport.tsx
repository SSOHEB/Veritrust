import type { Application, Job, User, Organization } from "@/types";
import { createContext } from "react";
import type { PublicClient, WalletClient } from "viem";

interface GlobalContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    type: "company" | "candidate"
  ) => Promise<void>;
  register: (
    userData: Partial<User>,
    type: "company" | "candidate"
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
  jobPublicClient: PublicClient | undefined;
  jobWalletClient: WalletClient | undefined;
  contractAddress: string;
  companyJobs: Job[] | undefined;
  allJobs: Job[] | undefined;
  myApplication: Application[] | undefined;
  companyApplications: Application[] | undefined;
  uploadZKProof: (
    applicationId: string,
    proofType: string,
    file: File,
    userType: "company" | "candidate",
    description: string
  ) => Promise<void>;
  updateApplicationStatus?: (
    applicationId: string,
    status: Application["status"] // "pending" | "reviewed" | "accepted" | "rejected"
  ) => Promise<void>;
  verifyCompany: () => Promise<void>;
  organization: Organization | null;
  updateOrganization: (orgData: Partial<Organization>) => Promise<void>;
}

export const GlobalContext = createContext<GlobalContextType>({
  user: null,
  login: async () => { },
  register: async () => { },
  logout: () => { },
  loading: false,
  jobPublicClient: undefined,
  jobWalletClient: undefined,
  contractAddress: "",
  companyJobs: undefined,
  allJobs: undefined,
  myApplication: undefined,
  companyApplications: undefined,
  uploadZKProof: async () => { },
  verifyCompany: async () => { },
  organization: null,
  updateOrganization: async () => { },
});
