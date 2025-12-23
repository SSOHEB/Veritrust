import type {
  Application,
  Job,
  User,
} from "@/types";
import { useEffect, useState, type ReactNode } from "react";
import { GlobalContext } from "./GlobalContextExport";
import { onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  onSnapshot,
  collection,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { app, auth } from "@/lib/firebase";

const CONTRACT_ADDRESS = "0x519a9057Bfe3e6bab6EDb7128b7Dba44d2adC083";

export function GlobalContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [myApplication, setMyApplication] = useState<Application[]>([]);
  const [companyApplications, setCompanyApplications] = useState<Application[]>([]);

  // Defined as undefined since we removed direct contract interaction in this phase
  const jobPublicClient = undefined;
  const jobWalletClient = undefined;

  useEffect(() => {
    // 1. Auth Listener: sync with Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        // User logged out
        setUser(null);
        setCompanyJobs([]);
        setMyApplication([]);
        setCompanyApplications([]);
        setLoading(false);
      } else {
        // User logged in, but we wait for Firestore sync in the next effect
        // We set a temporary user object so the second effect triggers
        // This avoids starting Firestore listeners inside this sync callback
        // However, we need the user ID to trigger the next effect
        // We won't fully set 'user' here to avoid race conditions, 
        // OR we set a partial user and let the second effect enrich it.
        // Better: Just handle auth state here.
        // But the previous logic used onSnapshot immediately. 
        // Let's rely on a separate 'authUserId' state or similar if we want to be pure.
        // But reusing 'user' state is fine if we are careful.

        // Initial partial user from Auth (if we don't have Firestore data yet)
        // We only set this if we don't have a user, or if the ID changed.
        setUser((prev) => {
          if (prev?.id === firebaseUser.uid) return prev;
          return {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "",
            type: "candidate", // Default safely
            createdAt: new Date().toISOString(),
          } as User;
        });
        // Note: loading is strictly set to false only after firestore sync usually?
        // But auth check is done. 
        // We'll keep loading true until Firestore user logic settles if possible.
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Global Firestore Listeners (User Profile & All Jobs)
  useEffect(() => {
    // We only listen if we have a user ID (from Auth)
    if (!user?.id) {
      setLoading(false); // No user, so we are done loading (guest mode)
      return;
    }

    setLoading(true);
    const db = getFirestore(app);

    // A. User Profile Listener
    const userUnsub = onSnapshot(doc(db, "users", user.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Compatibility: Map 'role' to 'type' (e.g., "recruiter" -> "company")
        let derivedType = data.type;
        if (!derivedType && data.role === "recruiter") {
          derivedType = "company";
        }

        const userData = {
          ...data,
          type: derivedType || "candidate",
          id: user.id
        } as User;
        // Avoid infinite loop if data matches strict equality, but React useState handles that logic mostly.
        // But we must be careful not to reset 'user' to something that triggers this effect again if dependencies change.
        // Dependency is user.id. So updating other fields is safe.
        setUser((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(userData)) return prev;
          return userData;
        });
      } else {
        // Doc doesn't exist yet (new signup), keep auth defaults
        // No action needed, or maybe init the doc?
      }
      setLoading(false);
    }, (error) => {
      console.error("User listener error:", error);
      setLoading(false);
    });

    // B. All Jobs Listener
    const allJobsUnsub = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const jobsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
      setAllJobs(jobsData);
    }, (error) => console.error("Jobs listener error:", error));

    return () => {
      userUnsub();
      allJobsUnsub();
    };
  }, [user?.id]); // Only re-subscribe if the User ID changes (login/logout/switch)

  // 3. Role-Specific Listeners (Company/Candidate)
  useEffect(() => {
    if (!user?.id) return;

    // Safety guard: if type is missing or default, we might not want to query yet? 
    // But 'candidate' is default.
    // If 'candidate' applies to everyone, then it's fine.
    // But if we have mixed logic, we should be careful.

    const db = getFirestore(app);
    const unsubs: (() => void)[] = [];

    if (user.type === "company") {
      try {
        // Fetch Company Jobs
        console.log("GlobalContext: RECRUITER QUERY companyId:", user.id);
        const qJobs = query(collection(db, "jobs"), where("companyId", "==", user.id));
        const jobsUnsub = onSnapshot(qJobs, (snapshot) => {
          setCompanyJobs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Job)));
        }, (err) => console.error("Company jobs listener failed:", err));
        unsubs.push(jobsUnsub);

        // Fetch Company Applications
        console.log("GlobalContext: RECRUITER QUERY APPS companyId (auth uid):", user.id);
        // FIXME: Company identity is currently derived from auth UID. This will be normalized post-MVP.
        // We query nested job.company.id to match the current schema where job.company carries the ID.
        const qApps = query(collection(db, "applications"), where("companyId", "==", user.id));
        const appsUnsub = onSnapshot(qApps, (snapshot) => {
          console.log("GlobalContext: RECRUITER APPS SNAPSHOT SIZE:", snapshot.size, "for companyId:", user.id);
          setCompanyApplications(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Application)));
        }, (err) => console.error("Company apps listener failed:", err));
        unsubs.push(appsUnsub);
      } catch (e) {
        console.error("Error setting up company listeners:", e);
      }

    } else if (user.type === "candidate") {
      try {
        // Fetch My Applications
        const qApps = query(collection(db, "applications"), where("candidateId", "==", user.id));
        const appsUnsub = onSnapshot(qApps, (snapshot) => {
          setMyApplication(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Application)));
        }, (err) => console.error("Candidate apps listener failed:", err));
        unsubs.push(appsUnsub);
      } catch (e) {
        console.error("Error setting up candidate listeners:", e);
      }
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [user?.id, user?.type]);

  const login = async (
    _email: string,
    _password: string,
    _type: "company" | "candidate"
  ) => {
    console.warn("GlobalContext login called - implementation relies on Firebase Auth listener");
  };

  const register = async (
    _userData: Partial<User>,
    _type: "company" | "candidate"
  ) => {
    console.warn("GlobalContext register called");
  };

  const logout = () => {
    auth.signOut();
  };


  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: Application["status"]
  ) => {
    const db = getFirestore(app);
    // No mapping needed as we now use exact status strings from domain model
    // newStatus is "pending" | "reviewed" | "accepted" | "rejected"

    try {
      await updateDoc(doc(db, "applications", applicationId), {
        status: newStatus
      });
      // No need to setCompanyApplications locally; onSnapshot will handle it.

      // Legacy Contract Call (Optional - keeping for reference if contract sync is desired later)
      /*
      if (jobWalletClient) {
         // Contract logic here...
      }
      */
    } catch (err) {
      console.error("Error updating application status:", err);
    }
  };

  // Mock function to simulate uploading zk proof
  const uploadZKProof = async (
    applicationId: string,
    proofType: string,
    file: File,
    userType: "company" | "candidate",
    description: string
  ): Promise<void> => {
    console.log("uploadZKProof called", { applicationId, proofType, file, userType, description });

    // Simulation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (userType === "candidate" && user?.id) {
      const db = getFirestore(app);
      try {
        // Generate simulated proof data
        const zkVerificationData = {
          isVerified: true,
          proofId: `zkp_${Math.random().toString(36).substr(2, 9)}`,
          verifiedAt: new Date().toISOString()
        };

        const blockchainStampData = {
          txHash: `0x${Math.random().toString(16).substr(2, 40)}`,
          network: "Simulated Ethereum",
          blockNumber: Math.floor(Math.random() * 10000000),
          timestamp: new Date().toISOString()
        };

        await updateDoc(doc(db, "users", user.id), {
          zkVerification: zkVerificationData,
          blockchainStamp: blockchainStampData
        });
        console.log("zkVerification updated for candidate");
      } catch (e) {
        console.error("Error updating zkVerification:", e);
      }
    }
  };

  const verifyCompany = async (): Promise<void> => {
    if (user?.type !== "company" || !user.id) return;

    console.log("verifyCompany called for", user.id);
    // Simulation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const db = getFirestore(app);
    try {
      // Generate simulated proof data
      const zkVerificationData = {
        isVerified: true,
        proofId: `zkp_${Math.random().toString(36).substr(2, 9)}`,
        verifiedAt: new Date().toISOString()
      };

      const blockchainStampData = {
        txHash: `0x${Math.random().toString(16).substr(2, 40)}`,
        network: "Simulated Ethereum",
        blockNumber: Math.floor(Math.random() * 10000000),
        timestamp: new Date().toISOString()
      };

      // 1. Update Company User Doc
      await updateDoc(doc(db, "users", user.id), {
        verification: {
          status: "verified",
          verifiedAt: new Date().toISOString()
        },
        zkVerification: zkVerificationData,
        blockchainStamp: blockchainStampData
      });

      // 2. Propagate to all company jobs (Simulated relational update)
      const { getDocs, writeBatch } = await import("firebase/firestore");
      const jobsQuery = query(collection(db, "jobs"), where("companyId", "==", user.id));
      const snapshot = await getDocs(jobsQuery);

      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach((d) => {
          batch.update(d.ref, {
            "company.verification": {
              status: "verified",
              verifiedAt: new Date().toISOString()
            }
          });
        });
        await batch.commit();

      }

      console.log("Company verified and jobs updated");
    } catch (e) {
      console.error("Error verifying company:", e);
    }
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
        companyJobs,
        allJobs,
        myApplication,
        companyApplications,
        uploadZKProof,
        updateApplicationStatus,
        verifyCompany,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
