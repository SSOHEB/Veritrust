export interface User {
  id: string;
  email: string;
  name: string;
  type: "company" | "candidate";
  createdAt: string;
  verified?: boolean;
  verifiedAt?: string;
}

export interface Company {
  id: string;
  email: string;
  name: string;
  type: "company";
  createdAt: string;

  companyName: string;
  industry: string;
  size: string;
  description: string;
  website?: string;
  logo?: string;

  verified?: boolean;
  verifiedAt?: string;
  verificationMethod?: "zk-simulation";
}

export type Candidate = any;
export type Job = any;
export type Application = any;

export type ContractJob = any;
export type ContractApplication = any;
export type CompanyApplicationInterface = any;
export type Application1 = any;
