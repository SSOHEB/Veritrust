import type {
  Application,
  CompanyApplicationInterface,
  Job,
  User,
} from "@/types";
import { useEffect, useState, type ReactNode } from "react";
import { GlobalContext } from "./GlobalContextExport";
import { useNavigate } from "react-router-dom";
import { flowTestnet } from "viem/chains";
import { type Hex, type PublicClient, type WalletClient } from "viem";
import { contractAbi } from "@/lib/contractAbi";

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
//     description: "Leading software development company",
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyJobs] = useState<Job[]>([]);
  const [myApplication] = useState<Application[]>([]);
  const navigate = useNavigate();

  const [jobPublicClient] = useState<PublicClient | undefined>();
  const [jobWalletClient] = useState<WalletClient | undefined>();

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


  const login = async (
    email: string,
    _password: string,
    type: "company" | "candidate"
  ) => {
    // avoid unused-parameter build failures (login is currently a stub)
    void email;
    void type;

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
