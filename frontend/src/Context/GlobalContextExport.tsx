import type { Application, Job, User } from "@/types";
import { createContext } from "react";
import { type User as PrivyUser } from "@privy-io/react-auth";
import type { PublicClient, WalletClient } from "viem";

interface GlobalContextType {
  user: any | null;
  privyUser?: PrivyUser | null;
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
  job: Job[] | undefined;
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
    status: "approved" | "rejected"
  ) => Promise<void>;
}

export const GlobalContext = createContext<GlobalContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loading: false,
  jobPublicClient: undefined,
  jobWalletClient: undefined,
  contractAddress: "",
  job: undefined,
  myApplication: undefined,
  companyApplications: undefined,
  uploadZKProof: async () => {},
});
