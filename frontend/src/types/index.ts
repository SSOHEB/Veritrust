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
}

// {
//     "candidateId": "jaydeep.dey03@gmail.com",
//     "name": "Jaydeep Candidate",
//     "description": [
//         "Passionate full-stack developer with 5+ years of experience in React and modern web technologies. Love building user-friendly applications and learning new technologies."
//     ],
//     "contacts": [
//         "jaydeep.dey03@gmail.com",
//         "+1-555-0123",
//         "Bangalore, IN"
//     ],
//     "education": [
//         "BTech Computer Science - VIT University"
//     ],
//     "skills": [
//         "Typescript",
//         "React",
//         "Javascript"
//     ],
//     "resumePath": [
//         "/Users/jaydeepdey/Desktop/doc/Resume_Jaydeep_2024.pdf"
//     ],
//     "profileScore": ""
// }

export interface Candidate {
  candidateId: string;
  name: string;
  email: string;
  description: string[];
  contacts: string[];
  education: string[];
  skills: string[];
  resumePath: string[];
  profileScore: string;
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
  compatibilityScore?: number;
  aiApplied?: boolean;
  documents?: {
    type: "interview_proof" | "offer_letter";
    url: string;
    uploadedBy: "company" | "candidate";
    uploadedAt: string;
  }[];
  notes?: string;
}

export interface AISearchQuery {
  query: string;
  filters?: {
    experience?: number;
    skills?: string[];
    location?: string;
  };
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
  compatibilityScore?: number;
  aiApplied?: boolean;
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
