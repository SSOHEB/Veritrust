import type {
  Application,
  Candidate,
  Company,
  CompanyApplicationInterface,
  ContractApplication,
  ContractJob,
  Job,
  User,
} from "@/types";
import { useEffect, useState, type ReactNode } from "react";
import { GlobalContext } from "./GlobalContextExport";
import { useNavigate } from "react-router-dom";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { flowTestnet } from "viem/chains";
import {
  createPublicClient,
  createWalletClient,
  custom,
  formatEther,
  type Hex,
} from "viem";
import { contractAbi } from "@/lib/contractAbi";
import { JobStatus, JobType, LocationType } from "@/lib/utils";

// const mockUsers: User[] = [
//   {
//     id: "1",
//     email: "company@demo.com",
//     name: "Tech Innovators Inc",
//     type: "company",
//     createdAt: "2024-01-01",
//     companyName: "Tech Innovators Inc",
//     industry: "Technology",
//     size: "100-500",
//     description: "Leading AI and software development company",
//     website: "https://techinnovators.com",
//   } as Company,
//   {
//     id: "2",
//     email: "candidate@demo.com",
//     name: "John Developer",
//     type: "candidate",
//     createdAt: "2024-01-01",
//     title: "Senior Frontend Developer",
//     experience: 5,
//     skills: ["React", "TypeScript", "Node.js", "Python"],
//     location: "San Francisco, CA",
//     bio: "Passionate full-stack developer with 5+ years of experience",
//     education: "BS Computer Science",
//     phone: "+1-555-0123",
//   } as Candidate,
// ];

const CONTRACT_ADDRESS = "0x519a9057Bfe3e6bab6EDb7128b7Dba44d2adC083";

export function GlobalContextProvider({ children }: { children: ReactNode }) {
  const [_, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [myApplication, setMyApplication] = useState<Application[]>([]);
  const navigate = useNavigate();

  const { wallets } = useWallets();
  const { ready, user } = usePrivy();

  const [jobPublicClient, setJobPublicClient] = useState<any>();
  const [jobWalletClient, setJobWalletClient] = useState<any>();

  const [companyApplications, setCompanyApplications] = useState<
    CompanyApplicationInterface[]
  >([]);

  useEffect(() => {
    // Check for stored auth
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!wallets || wallets.length === 0) return;

    (async function () {
      try {
        const privyProvider = await wallets[0].getEthereumProvider();
        await wallets[0].switchChain(flowTestnet.id);

        const publicClient = createPublicClient({
          chain: flowTestnet,
          transport: custom(privyProvider),
        });

        const balance1 = await publicClient.getBalance({
          address: wallets[0].address as Hex,
        });
        console.log(formatEther(balance1), "formatted");

        const walletClient = await createWalletClient({
          account: wallets[0].address as Hex,
          chain: flowTestnet,
          transport: custom(privyProvider),
        });

        setJobPublicClient(publicClient);
        setJobWalletClient(walletClient);
      } catch (err) {
        console.error("Error initializing wallet clients:", err);
      }
    })();
  }, [ready, wallets]);

  const login = async (
    email: string,
    _password: string,
    type: "company" | "candidate"
  ) => {
    setLoading(true);
    // Mock authentication
    // const foundUser = mockUsers.find(
    //   (u) => u.email === email && u.type === type
    // );

    // if (foundUser) {
    //   setUser(foundUser);
    //   localStorage.setItem("user", JSON.stringify(foundUser));
    //   navigate(`/${type}`);
    // } else {
    //   // Fallback to creating a mock user based on type
    //   // const mockUser = type === "company" ? mockUsers[0] : mockUsers[1];
    //   setUser(mockUser);
    //   localStorage.setItem("user", JSON.stringify(mockUser));
    //   navigate(`/${type}`);
    // }

    setLoading(false);
  };

  const register = async (
    userData: Partial<User>,
    type: "company" | "candidate"
  ) => {
    setLoading(true);
    // Mock registration
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email!,
      name: userData.name!,
      type,
      createdAt: new Date().toISOString(),
      ...userData,
    };

    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    navigate("/");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    if (!jobPublicClient) return;
    (async function () {
      const balance = await jobPublicClient?.getBalance({
        address: "0xFB1322eC42f890Cd7b4BC26AD697abb917Db1517" as Hex,
      });
      console.log(formatEther(balance), "Balance in wei");
    })();
  }, [jobPublicClient]);

  // const fetchAllJobs = async () => {
  //   if (!jobPublicClient) return;
  //   try {
  //     const jobs = await jobPublicClient.readContract({
  //       address: CONTRACT_ADDRESS as Hex,
  //       abi: contractAbi,
  //       functionName: "getAllJobs",
  //       args: [],
  //     });

  //     console.log("Fetched jobs from contract: loggggg", jobs);

  //     // @ts-ignore
  //     console.log(user.google?.email, "user email");
  //     const parsedJobs = (jobs as ContractJob[])
  //       .filter(
  //         (job) =>
  //           // @ts-ignore
  //           job.companyId == user.google?.email || job.companyId == user.id
  //       ) // only jobs for this company
  //       .map((job) => ({
  //         id: job.jobId,
  //         companyId: job.companyId,
  //         title: job.title,
  //         description: job.description,
  //         requirements: job.requirements,
  //         skills: job.skills,
  //         location: LocationType[job.location], // map enum index → string
  //         type: JobType[job.jobType], // map enum index → string
  //         salary: {
  //           min: Number(job.salaryRange?.[0] || 0),
  //           max: Number(job.salaryRange?.[1] || 0),
  //           currency: "USD",
  //         },
  //         postedAt: new Date().toISOString(),
  //         status: JobStatus[job.status], // map enum index → string
  //       }));

  //     console.log(parsedJobs, "loggggg");
  //     return parsedJobs;
  //     // setCompanyJobs(parsedJobs);
  //   } catch (err) {
  //     console.error("Error fetching jobs:", err);
  //   }
  // };

  useEffect(() => {
    if (!jobWalletClient) return;
    if (!jobPublicClient) return;
    if (!user) return;

    (async function () {
      try {
        const jobs = await jobPublicClient.readContract({
          address: CONTRACT_ADDRESS as Hex,
          abi: contractAbi,
          functionName: "getAllJobs",
          args: [],
        });

        console.log("Fetched jobs from contract:", jobs);

        console.log(user.google?.email, "user email");
        const parsedJobs = (jobs as ContractJob[])
          .filter(
            (job) =>
              job.companyId == user.google?.email || job.companyId == user.id
          ) // only jobs for this company
          .map((job) => ({
            id: job.jobId,
            companyId: job.companyId,
            title: job.title,
            description: job.description,
            requirements: job.requirements,
            skills: job.skills,
            location: LocationType[job.location], // map enum index → string
            type: JobType[job.jobType], // map enum index → string
            salary: {
              min: Number(job.salaryRange?.[0] || 0),
              max: Number(job.salaryRange?.[1] || 0),
              currency: "USD",
            },
            postedAt: new Date().toISOString(),
            status: JobStatus[job.status], // map enum index → string
          }));

        console.log(parsedJobs, "loggggg");

        setCompanyJobs(parsedJobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    })();
  }, [jobWalletClient, jobPublicClient, user]);

  useEffect(() => {
    if (!jobWalletClient) return;
    if (!jobPublicClient) return;
    if (!user) return;
    (async function () {
      try {
        const applications = await jobPublicClient.readContract({
          address: CONTRACT_ADDRESS as Hex,
          abi: contractAbi,
          functionName: "getAllApplications",
          args: [],
        });

        console.log("Fetched applications:", applications);

        const filteredApplications = (
          applications as ContractApplication[]
        ).filter(
          (app) =>
            // @ts-ignore
            app.candidateId == user.google?.email || app.candidateId == user.id
        ); // only applications for this candidate

        // fetched application : {
        //     "applicationId": "1",
        //     "jobId": "1",
        //     "candidateId": "jaydeep.dey03@gmail.com",
        //     "applicationDate": "2025-09-26T06:09:39.622Z",
        //     "status": 0
        // }

        const detailedApplications: Application[] = [];

        for (const app of filteredApplications as ContractApplication[]) {
          const jobData = await jobPublicClient.readContract({
            address: CONTRACT_ADDRESS as Hex,
            abi: contractAbi,
            functionName: "getJob",
            args: [app.jobId],
          });

          const candidateData = await jobPublicClient.readContract({
            address: CONTRACT_ADDRESS as Hex,
            abi: contractAbi,
            functionName: "getCandidate",
            args: [app.candidateId],
          });

          const applicationStatusMap: Record<number, Application["status"]> = {
            0: "pending",
            1: "reviewed",
            2: "accepted",
            3: "rejected",
          };

          const parsedJob: Job = {
            id: (jobData as ContractJob).jobId,
            companyId: (jobData as ContractJob).companyId,
            title: (jobData as ContractJob).title,
            description: (jobData as ContractJob).description,
            requirements: (jobData as ContractJob).requirements,
            skills: (jobData as ContractJob).skills,
            location: LocationType[(jobData as ContractJob).location], // map enum index → string
            type: JobType[(jobData as ContractJob).jobType], // map enum index → string
            salary: {
              min: Number((jobData as ContractJob).salaryRange?.[0] || 0),
              max: Number((jobData as ContractJob).salaryRange?.[1] || 0),
              currency: "USD",
            },
            postedAt: new Date().toISOString(),
            status: JobStatus[(jobData as ContractJob).status], // map enum index → string
          } as Job;

          const candidateDataParsed: Candidate = {
            candidateId: (candidateData as Candidate).candidateId,
            email: (candidateData as Candidate).contacts?.[0] || "",
            name: (candidateData as Candidate).name,
            description: (candidateData as Candidate).description,
            contacts: (candidateData as Candidate).contacts,
            education: (candidateData as Candidate).education,
            skills: (candidateData as Candidate).skills,
            resumePath: (candidateData as Candidate).resumePath,
            profileScore: (candidateData as Candidate).profileScore,
          };

          const detailedApplication: Application = {
            id: app.applicationId,
            job: parsedJob,
            candidate: candidateDataParsed,
            candidateId: app.candidateId,
            jobId: app.jobId,

            status: applicationStatusMap[app.status],
            appliedAt: app.applicationDate,
          };

          detailedApplications.push(detailedApplication);
        }

        console.log(detailedApplications, "detailed app");
        setMyApplication(detailedApplications);
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    })();
  }, [jobWalletClient, jobPublicClient, CONTRACT_ADDRESS, user]);

  useEffect(() => {
    if (!jobWalletClient) return;
    if (!jobPublicClient) return;
    if (!user) return;

    (async function () {
      try {
        const applications = await jobPublicClient.readContract({
          address: CONTRACT_ADDRESS as Hex,
          abi: contractAbi,
          functionName: "getAllApplications",
          args: [],
        });

        console.log("Fetched applications:", applications);

        // const jobs = await jobPublicClient.readContract({
        //   address: CONTRACT_ADDRESS as Hex,
        //   abi: contractAbi,
        //   functionName: "getAllJobs",
        //   args: [],
        // });

        // // First filter jobs that belong to this company
        // const companyJobs = (jobs as ContractJob[]).filter(
        //   (job) =>
        //     // @ts-ignore
        //     job.companyId == user.google?.email || job.companyId == user.id
        // );

        // // Then filter applications for those company jobs
        // const filteredApplications = (
        //   applications as ContractApplication[]
        // ).filter((app) => companyJobs.some((job) => job.jobId === app.jobId));

        const filteredApplications = applications;

        console.log(filteredApplications, "company applications");

        // Process the applications to create detailed Application objects
        const detailedApplications: CompanyApplicationInterface[] = [];

        const applicationStatusMap: Record<
          number,
          CompanyApplicationInterface["status"]
        > = {
          0: "pending",
          1: "reviewed",
          2: "accepted",
          3: "rejected",
        };

        for (const app of filteredApplications as ContractApplication[]) {
          const jobData = await jobPublicClient.readContract({
            address: CONTRACT_ADDRESS as Hex,
            abi: contractAbi,
            functionName: "getJob",
            args: [app.jobId],
          });

          const candidateData = await jobPublicClient.readContract({
            address: CONTRACT_ADDRESS as Hex,
            abi: contractAbi,
            functionName: "getCandidate",
            args: [app.candidateId],
          });

          console.log(candidateData, "candidate data");

          const parsedJob: Job = {
            id: (jobData as ContractJob).jobId,
            companyId: (jobData as ContractJob).companyId,
            title: (jobData as ContractJob).title,
            description: (jobData as ContractJob).description,
            requirements: (jobData as ContractJob).requirements,
            skills: (jobData as ContractJob).skills,
            location: LocationType[(jobData as ContractJob).location], // map enum index → string
            type: JobType[(jobData as ContractJob).jobType], // map enum index → string
            salary: {
              min: Number((jobData as ContractJob).salaryRange?.[0] || 0),
              max: Number((jobData as ContractJob).salaryRange?.[1] || 0),
              currency: "USD",
            },
            postedAt: new Date().toISOString(),
            status: JobStatus[(jobData as ContractJob).status], // map enum index → string
          } as Job;

          const candidateDataParsed: Candidate = {
            candidateId: (candidateData as Candidate).candidateId,
            email: (candidateData as Candidate).contacts?.[0] || "",
            name: (candidateData as Candidate).name,
            description: (candidateData as Candidate).description,
            contacts: (candidateData as Candidate).contacts,
            education: (candidateData as Candidate).education,
            skills: (candidateData as Candidate).skills,
            resumePath: (candidateData as Candidate).resumePath,
            profileScore: (candidateData as Candidate).profileScore,
          };

          //         {
          //   id: "1",
          //   jobId: "1",
          //   candidateId: "1",
          //   job: {
          //     id: "1",
          //     companyId: "1",
          //     title: "Senior Frontend Developer",
          //     description: "Looking for an experienced React developer",
          //     requirements: ["5+ years React", "TypeScript", "Node.js"],
          //     skills: ["React", "TypeScript", "JavaScript"],
          //     location: "San Francisco, CA",
          //     type: "full-time",
          //     salary: { min: 120000, max: 180000, currency: "USD" },
          //     postedAt: "2024-01-15",
          //     status: "active",
          //     company: {} as Company,
          //   },
          //   candidate: {
          //     id: "1",
          //     email: "john.doe@example.com",
          //     name: "John Doe",
          //     type: "candidate",
          //     createdAt: "2024-01-01",
          //     title: "Senior Frontend Developer",
          //     experience: 6,
          //     skills: ["React", "TypeScript", "JavaScript", "Node.js"],
          //     location: "San Francisco, CA",
          //     bio: "Passionate developer with 6+ years of experience in React and modern web technologies.",
          //     education: "BS Computer Science",
          //     phone: "+1-555-0123",
          //   },
          //   status: "pending",
          //   appliedAt: "2024-01-20",
          //   compatibilityScore: 92,
          //   aiApplied: false,
          // }
          const detailedApplication: CompanyApplicationInterface = {
            id: app.applicationId,
            job: parsedJob,
            candidate: candidateDataParsed,
            candidateId: app.candidateId,
            jobId: app.jobId,
            status: applicationStatusMap[app.status],
            appliedAt: app.applicationDate,
            compatibilityScore: Math.floor(Math.random() * 41) + 60, // Mocked score between 60-100
            aiApplied: Math.random() < 0.5, // Mocked boolean
          };

          console.log(detailedApplication, "detailed app");

          detailedApplications.push(detailedApplication);
        }
        console.log(detailedApplications, "fid app");
        setCompanyApplications(detailedApplications);
      } catch (error) {
        console.error("Error fetching company applications:", error);
      }
    })();
  }, [jobWalletClient, jobPublicClient, CONTRACT_ADDRESS, user]);

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: "approved" | "rejected"
  ) => {
    if (!jobWalletClient) return;

    const statusMap: Record<"approved" | "rejected", 0 | 1 | 2 | 3> = {
      approved: 2,
      rejected: 3,
    };

    try {
      const txHash = await jobWalletClient.writeContract({
        address: CONTRACT_ADDRESS as Hex,
        abi: contractAbi,
        functionName: "updateApplicationStatus",
        args: [applicationId, statusMap[newStatus]],
        chain: flowTestnet,
        account: jobWalletClient.account || null,
      });

      console.log("Transaction hash:", txHash);
      // Optionally, wait for transaction confirmation here

      // Update local state after successful blockchain update
      const mappedStatus = newStatus === "approved" ? "accepted" : "rejected";
      setCompanyApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === applicationId ? { ...app, status: mappedStatus } : app
        )
      );
    } catch (err) {
      console.error("Error updating application status:", err);
    }
  };

  // Mock function to simulate uploading zk proof

  const uploadZKProof = (
    applicationId: string,
    proofType: string,
    file: File,
    userType: "company" | "candidate",
    description: string
  ) => {
    return new Promise<void>((resolve) => {
      console.log(
        applicationId,
        proofType,
        file,
        userType,
        description,
        "upload zk proof function called"
      );
      setTimeout(() => resolve(), 1000);
    });
  };

  return (
    <GlobalContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        jobPublicClient,
        jobWalletClient,
        contractAddress: CONTRACT_ADDRESS,
        job: companyJobs,
        myApplication,
        companyApplications,
        uploadZKProof,
        updateApplicationStatus,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
