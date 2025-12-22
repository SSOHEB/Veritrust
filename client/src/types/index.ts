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
  verification?: {
    status: "verified" | "unverified" | "rejected";
    verifiedAt: string;
  };
}

// ... (comment block)

// Candidate data is currently consumed from multiple sources (contract + legacy UI mocks).
// Keep the type flexible so the app can compile while we progressively align shapes.
export interface Candidate {
  // Contract-shaped fields
  candidateId?: string;
  description?: string[] | string;
  contacts?: string[] | string;
  education?: string[] | string;
  resumePath?: string[] | string;
  profileScore?: string;

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

  // Verification fields
  zkVerification?: {
    isVerified: boolean;
    proofId: string;
    verifiedAt: string;
  };
  blockchainStamp?: {
    txHash: string;
    network: string; // "Simulated Ethereum"
    blockNumber: number;
    timestamp: string;
  };
}

export interface Job {
  id: string;
  companyId: string;
  company?: Company;
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
  job: Job;
  candidate: Candidate;
  status: "pending" | "reviewed" | "accepted" | "rejected";
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

export interface CompanyApplicationInterface {
  id: string;
  jobId: string;
  candidateId: string;
  job: Job;
  candidate: Candidate;
  status: "pending" | "reviewed" | "accepted" | "rejected";
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
