export interface User {
  id: string;
  email: string;
  name: string;
  type: "company" | "candidate";
  createdAt: string;
}

export interface Company extends User {
  type: "company";
  companyName: string;
  industry: string;
  size: string;
  description: string;
  website?: string;
  logo?: string;

  // GLOBAL VERIFICATION STATE (Single Source of Truth)
  verification: {
    status: "unverified" | "pending" | "verified" | "rejected";
    lastUpdated: string;
    targetSmartContract?: string;
    onChainTxHash?: string;
    zkProofId?: string;
  };
}

export interface Organization {
  id: string;
  companyName: string;
  domain: string;
  description: string;
  industry?: string;
  size?: string;
  logo?: string;
  // Legacy support, try to migrate to Company interface where possible
  verification: {
    zkVerified: boolean;
    blockchainStamped: boolean;
    verifiedAt?: string;
    txHash?: string;
  };
}

// ... (comment block)

// Candidate data is currently consumed from multiple sources (contract + legacy UI mocks).
export interface Candidate {
  // Common/legacy UI fields
  id?: string;
  email?: string;
  name?: string;
  type?: "candidate";
  createdAt?: string;
  title?: string;
  experience?: number;
  skills?: string[];
  location?: string;
  bio?: string;
  phone?: string;

  // GLOBAL VERIFICATION STATE
  verification?: {
    status: "unverified" | "pending" | "verified" | "rejected";
    lastUpdated: string;
    zkProofId?: string;
  };

  // Contract-shaped fields (Legacy/Specific views)
  candidateId?: string;
  description?: string[] | string;
  contacts?: string[] | string;
  education?: string[] | string;
  resumePath?: string[] | string;
  profileScore?: string;
}

export interface Job {
  id: string;
  companyId: string;
  company?: Company; // Hydrated company profile
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship" | "freelance";
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  postedAt: string;
  deadline?: string;
  status: "active" | "inactive";
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  job: Job;
  candidate: Candidate;

  // STRICT STATE MACHINE
  status: ApplicationStatus;

  appliedAt: string;
  documents?: {
    type: "interview_proof" | "offer_letter";
    url: string;
    uploadedBy: "company" | "candidate";
    uploadedAt: string;
  }[];
  notes?: string;
}

export interface ContractJob {
  jobId: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  location: number; // enum index
  salaryRange: string[]; // two values: [min, max]
  jobType: number; // enum index
  status: number; // enum index
}

export interface ContractApplication {
  jobLocation: any;
  candidateEmail: string;
  candidatePhone: string;
  resumeUrl: string;
  coverLetter: string;
  jobTitle: any;
  companyName: any;
  companyId: any;
  candidateName: any;
  applicationId: string;
  jobId: string;
  candidateId: string;
  applicationDate: string;
  status: number; // enum index
}

// Deprecated / Legacy Interface (Maintain for minimal breakage until full refactor)
export interface CompanyApplicationInterface {
  id: string;
  jobId: string;
  candidateId: string;
  job: Job;
  candidate: Candidate;
  status: "applied" | "under_review" | "accepted" | "rejected" | "exam_invited";
  appliedAt: string;
}

export interface Application1 {
  jobTitle: any;
  companyName: any;
  candidateName: any;
  appliedDate: string | number | Date;
  id: string;
  job: Job;
  company: Company;
  candidate: Candidate;
  status: "approved" | "rejected" | "pending" | "verified";
  appliedAt: string;
  companyAction?: {
    status: "approved" | "rejected";
    actionDate: string;
    proofDocument?: {
      name: string;
      url: string;
      uploadDate: string;
    };
  } | null;
  verificationDate?: string;
}

export interface User1 {
  id: string;
  name: string;
  email: string;
  role: "candidate" | "company";
}

// ENUMS matching Smart Contract (Using const assertions for erasableSyntaxOnly compatibility)
// ENUMS matching Smart Contract (Using const assertions for erasableSyntaxOnly compatibility)
export const Location = {
  REMOTE: "remote",
  HYBRID: "hybrid",
  ONSITE: "onsite"
} as const;
export type Location = typeof Location[keyof typeof Location];

export const JobType = {
  FULL_TIME: "full-time",
  PART_TIME: "part-time",
  CONTRACT: "contract",
  INTERNSHIP: "internship",
  FREELANCE: "freelance"
} as const;
export type JobType = typeof JobType[keyof typeof JobType];

export const JobStatus = {
  OPEN: "active",
  CLOSED: "closed",
  DRAFT: "draft"
} as const;
export type JobStatus = typeof JobStatus[keyof typeof JobStatus];

export const ApplicationStatus = {
  APPLIED: "pending", // Legacy mapping
  UNDER_REVIEW: "reviewed", // Legacy mapping
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXAM_INVITED: "exam_invited"
} as const;
export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];
