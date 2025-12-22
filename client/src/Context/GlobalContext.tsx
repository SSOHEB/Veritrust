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
    const db = getFirestore(app);

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // 1. Fetch User Profile
        const userUnsub = onSnapshot(doc(db, "users", firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            // Merge firebase auth email/name if missing in firestore (optional but good for sync)
            const userData = { id: firebaseUser.uid, ...docSnap.data() } as User;
            setUser(userData);
          } else {
            // Handle case where user authenticates but no firestore doc exists yet
            // Maybe wait for registration? Or just set partial user?
            // For now, setting partial user from Auth
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || "",
              type: "candidate", // Default, will change if found in DB later
              createdAt: new Date().toISOString(),
            } as User);
          }
          setLoading(false);
        });

        // 2. Fetch All Jobs (Global Requirement)
        const allJobsUnsub = onSnapshot(collection(db, "jobs"), (snapshot) => {
          const jobsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
          setAllJobs(jobsData);
        });

        return () => {
          userUnsub();
          allJobsUnsub();
        };
      } else {
        setUser(null);
        setCompanyJobs([]);
        setAllJobs([]);
        setMyApplication([]);
        setCompanyApplications([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Effect to fetch role-specific data based on `user` state
  useEffect(() => {
    if (!user) return;
    const db = getFirestore(app);
    const unsubs: (() => void)[] = [];

    if (user.type === "company") {
      // Fetch Company Jobs
      const qJobs = query(collection(db, "jobs"), where("companyId", "==", user.id));
      const jobsUnsub = onSnapshot(qJobs, (snapshot) => {
        setCompanyJobs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Job)));
      });
      unsubs.push(jobsUnsub);

      // Fetch Company Applications (applications FOR this company)
      const qApps = query(collection(db, "applications"), where("companyId", "==", user.id));
      const appsUnsub = onSnapshot(qApps, (snapshot) => {
        setCompanyApplications(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Application)));
      });
      unsubs.push(appsUnsub);

    } else if (user.type === "candidate") {
      // Fetch My Applications
      const qApps = query(collection(db, "applications"), where("candidateId", "==", user.id));
      const appsUnsub = onSnapshot(qApps, (snapshot) => {
        setMyApplication(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Application)));
      });
      unsubs.push(appsUnsub);
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [user?.id, user?.type]); // Re-run if user ID or Type changes

  const login = async (
    _email: string,
    _password: string,
    _type: "company" | "candidate"
  ) => {
    // NOTE: Login is handled by LoginForm.tsx via signInWithPopup.
    // This function is kept for interface compatibility but may not be used directly for Auth changes.
    // In a real email/pass flow, implementation would go here.
    console.warn("GlobalContext login called - implementation relies on Firebase Auth listener");
  };

  const register = async (
    _userData: Partial<User>,
    _type: "company" | "candidate"
  ) => {
    // NOTE: Registration mostly happens via profile creation or post-auth hook.
    // Interface stub preserved.
    console.warn("GlobalContext register called");
  };

  const logout = () => {
    auth.signOut();
    // navigate("/"); // Removed useNavigate, so this line is commented out or removed
  };


  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: "approved" | "rejected"
  ) => {
    const db = getFirestore(app);
    const mappedStatus = newStatus === "approved" ? "accepted" : "rejected";

    try {
      await updateDoc(doc(db, "applications", applicationId), {
        status: mappedStatus
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
        allJobs,
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
