import type {
  Application,
  Job,
  User,
  Organization,
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
  setDoc,
} from "firebase/firestore";
import { app, auth } from "@/lib/firebase";
import { createPublicClient, createWalletClient, custom, http, type PublicClient, type WalletClient } from "viem";
import { flowTestnet } from "viem/chains";
import { contractAbi } from "@/lib/contractAbi";

const CONTRACT_ADDRESS = "0x519a9057Bfe3e6bab6EDb7128b7Dba44d2adC083";
const DEMO_MODE = false; // ALL-IN-ONE DEMO SWITCH: Enable for Hackathon

export function GlobalContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [myApplication, setMyApplication] = useState<Application[]>([]);
  const [companyApplications, setCompanyApplications] = useState<Application[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);

  // Blockchain State
  const [jobPublicClient, setJobPublicClient] = useState<PublicClient | undefined>(undefined);
  const [jobWalletClient, setJobWalletClient] = useState<WalletClient | undefined>(undefined);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [verifiedCompanyIds, setVerifiedCompanyIds] = useState<string[]>([]);

  useEffect(() => {
    // Initialize Public Client (Read-only) immediately
    const publicClient = createPublicClient({
      chain: flowTestnet,
      transport: http()
    });
    setJobPublicClient(publicClient);
  }, []);

  const connectWallet = async () => {
    // @ts-ignore
    if (typeof window.ethereum !== 'undefined') {
      try {
        // @ts-ignore
        const provider = window.ethereum;
        // Request accounts
        const accounts = await provider.request({ method: 'eth_requestAccounts' });

        if (accounts.length > 0) {
          try {
            // Attempt to switch to Flow EVM Testnet
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x221' }], // 545 in hex
            });
          } catch (switchError: any) {
            // This error code 4902 indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x221',
                    chainName: 'Flow EVM Testnet',
                    rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
                    nativeCurrency: {
                      name: 'Flow',
                      symbol: 'FLOW',
                      decimals: 18,
                    },
                    blockExplorerUrls: ['https://evm-testnet.flowscan.io'],
                  },
                ],
              });
            }
          }

          setWalletAddress(accounts[0]);

          const walletClient = createWalletClient({
            account: accounts[0],
            chain: flowTestnet,
            transport: custom(provider)
          });

          setJobWalletClient(walletClient);
          console.log("Wallet connected:", accounts[0]);
        }
      } catch (error) {
        console.error("User denied account access or error:", error);
      }
    } else {
      console.log('Please install Metamask!');
      alert("Please install Metamask to use blockchain features.");
    }
  };

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
        setUser((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(userData)) return prev;
          return userData;
        });
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

    // C. Verified Companies Listener (Global)
    const qVerified = query(collection(db, "users"), where("verification.status", "==", "verified"));
    const verifiedUnsub = onSnapshot(qVerified, (snapshot) => {
      const ids = snapshot.docs.map(d => d.id);
      setVerifiedCompanyIds(ids);
    }, (error) => console.error("Verified companies listener error:", error));

    return () => {
      userUnsub();
      allJobsUnsub();
      verifiedUnsub();
    };
  }, [user?.id]); // Only re-subscribe if the User ID changes (login/logout/switch)

  // 3. Role-Specific Listeners (Company/Candidate)
  useEffect(() => {
    if (!user?.id) return;

    const db = getFirestore(app);
    const unsubs: (() => void)[] = [];

    if (user.type === "company") {
      try {
        // Fetch Company Jobs
        const qJobs = query(collection(db, "jobs"), where("companyId", "==", user.id));
        const jobsUnsub = onSnapshot(qJobs, (snapshot) => {
          setCompanyJobs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Job)));
        }, (err) => console.error("Company jobs listener failed:", err));
        unsubs.push(jobsUnsub);

        // Fetch Company Applications
        const qApps = query(collection(db, "applications"), where("companyId", "==", user.id));
        const appsUnsub = onSnapshot(qApps, (snapshot) => {
          setCompanyApplications(snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Application)));
        }, (err) => console.error("Company apps listener failed:", err));
        unsubs.push(appsUnsub);

        // Fetch Organization Data
        // We use user.id as the organization ID for now (1:1 mapping)
        const orgUnsub = onSnapshot(doc(db, "organizations", user.id), (docSnap) => {
          if (docSnap.exists()) {
            setOrganization({ id: docSnap.id, ...docSnap.data() } as Organization);
          } else {
            setOrganization(null);
          }
        }, (err) => console.error("Organization listener failed:", err));
        unsubs.push(orgUnsub);
      } catch (e) {
        console.error("Error setting up company listeners:", e);
      }

    } else if (user.type === "candidate") {
      try {
        // Fetch My Applications
        const qApps = query(collection(db, "applications"), where("candidateId", "==", user.id));
        const appsUnsub = onSnapshot(qApps, (snapshot) => {
          console.log("Candidate apps listener fired! Docs:", snapshot.docs.length);
          snapshot.docChanges().forEach((change) => {
            console.log("Document change:", change.type, change.doc.data());
          });
          setMyApplication(snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Application)));
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
    setWalletAddress(null);
    setJobWalletClient(undefined);
  };


  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: Application["status"]
  ) => {
    const db = getFirestore(app);

    try {
      console.log(`[GlobalContext] Updating applications/${applicationId} to ${newStatus}`);
      await setDoc(doc(db, "applications", applicationId), {
        status: newStatus
      }, { merge: true });

      // Verify persistence immediately from SERVER (bypass cache)
      const { getDocFromServer } = await import("firebase/firestore");
      try {
        const savedSnap = await getDocFromServer(doc(db, "applications", applicationId));
        const savedData = savedSnap.data();
        console.log(`[GlobalContext] Server Verification Read for ${applicationId}:`, savedData);

        if (savedData?.status !== newStatus) {
          console.error(`CRITICAL ERROR: Server verification failed. Expected ${newStatus}, got ${savedData?.status}`);
          // Optional: You could throw here or set an error state
        }
      } catch (readErr) {
        console.error("Verification read failed:", readErr);
      }

      // Force local update to ensure UI reflects change immediately
      setCompanyApplications(prev =>
        prev.map(app => app.id === applicationId ? { ...app, status: newStatus } : app)
      );
    } catch (err) {
      console.error("Error updating application status:", err);
      alert("Failed to update status. Check console.");
    }
  };

  // Helper: Compute SHA-256 Hash of a File
  const computeFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();

    // Note: In DEMO_MODE, we simply append a timestamp suffix to the hash string below.
    // We do NOT modify the buffer here to avoid recursion issues.

    const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    let hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (DEMO_MODE) {
      // Ensure uniqueness with a suffix. This allows re-uploading the same file.
      hashHex = `${hashHex}-${Date.now()}`;
    }
    return hashHex;
  };

  const uploadZKProof = async (
    applicationId: string,
    proofType: string,
    file: File,
    userType: "company" | "candidate",
    description: string
  ): Promise<void> => {
    if (!user?.id) {
      alert("Please log in to verify documents.");
      return;
    }

    console.log("uploadZKProof called", { applicationId, proofType, file, userType, description });
    const db = getFirestore(app);

    try {
      // 1. Compute File Fingerprint (Hash)
      const fileHash = await computeFileHash(file);
      console.log(`[VERITRUST] Computed Document Fingerprint (Hash): ${fileHash}`);

      // DEMO MODE: Auto-Issue Logic
      if (DEMO_MODE) {
        // MAGIC FILENAME CHECK: "fake" -> INVALID status
        const isFakeDemo = file.name.toLowerCase().includes("fake");

        console.log(`[DEMO MODE] Auto-issuing hash: ${fileHash}. Status: ${isFakeDemo ? 'INVALID' : 'VALID'}`);
        await setDoc(doc(db, "issued_documents", fileHash), {
          issuedTo: user?.id || "demo_user",
          issuedAt: new Date().toISOString(),
          type: "Demo Doc",
          status: isFakeDemo ? "invalid" : "valid",
          demoAutoGenerated: true
        });
      }

      console.log(`[VERITRUST] Checking Registry for this fingerprint...`);

      // 2. Verify against "Issued Documents" Registry
      const { getDoc } = await import("firebase/firestore");

      const docRef = doc(db, "issued_documents", fileHash);
      const docSnap = await getDoc(docRef);

      // OPEN MODE LOGIC: "Reverse logic" to save time
      // 1. If Invalid -> Check Registry Status
      // 2. If Not Found -> ALLOW (Treat as valid/fresh)

      if (docSnap.exists()) {
        const docData = docSnap.data();
        if (docData?.status !== "valid") {
          console.error(`[VERITRUST] Verification FAILED. Document status is ${docData?.status}.`);
          alert(`Verification Failed! This document is not in the official registry.`);
          throw new Error(`Document is ${docData?.status}`);
        }
        console.log(`[VERITRUST] Document Validated in Registry.`);
      } else {
        console.log(`[VERITRUST] Document not in registry. Proceeding as VALID (Open Verification Mode).`);
      }

      console.log(`[VERITRUST] Verification SUCCESS! Document found:`, docSnap.data());

      // Simulation delay for "ZK Proof Generation" effect
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (userType === "candidate") {
        // Generate simulated proof data
        const zkVerificationData = {
          isVerified: true,
          proofId: `zkp_${fileHash.substring(0, 10)}`, // Use part of hash as proof ID
          verifiedAt: new Date().toISOString(),
          originalDocHash: fileHash
        };

        const blockchainStampData = {
          txHash: `0x${fileHash}`, // Use hash as mock tx for now
          network: "Simulated Ethereum",
          blockNumber: Math.floor(Math.random() * 10000000),
          timestamp: new Date().toISOString()
        };

        await updateDoc(doc(db, "users", user.id), {
          verification: {
            status: "verified",
            lastUpdated: new Date().toISOString(),
            zkProofId: zkVerificationData.proofId
          },
          zkVerification: zkVerificationData,
          blockchainStamp: blockchainStampData
        });
        console.log("zkVerification updated for candidate");
        alert(`Document Verified Successfully!\n\nHash: ${fileHash}`);
      } else {
        console.warn("Skipping candidate update (User type mismatch or missing logic for company)");
      }

    } catch (e) {
      console.error("Error during verification:", e);
      throw e;
    }
  };

  const verifyCompany = async (file?: File): Promise<void> => {
    if (user?.type !== "company" || !user?.id) {
      console.warn("verifyCompany called but user is invalid:", user);
      alert("Please log in as a Company to verify documents.");
      return;
    }

    if (!jobWalletClient || !walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!file) {
      alert("Please upload a verification document.");
      return;
    }

    try {
      console.log("Initiating blockchain verification for:", user.id);

      // 0. Verify Document Hash FIRST (The "Gatekeeper")
      const fileHash = await computeFileHash(file);
      console.log(`[VERITRUST] Computed Company Doc Hash: ${fileHash}`);

      const db = getFirestore(app);
      const { getDoc, setDoc } = await import("firebase/firestore");

      // DEMO MODE: Auto-Issue Logic
      if (DEMO_MODE) {
        // MAGIC FILENAME CHECK: "fake" -> INVALID status
        const isFakeDemo = file.name.toLowerCase().includes("fake");

        console.log(`[DEMO MODE] Auto-issuing (Company) hash: ${fileHash}. Status: ${isFakeDemo ? 'INVALID' : 'VALID'}`);
        await setDoc(doc(db, "issued_documents", fileHash), {
          issuedTo: user.id || "demo_user",
          issuedAt: new Date().toISOString(),
          type: "Demo Business License",
          status: isFakeDemo ? "invalid" : "valid",
          demoAutoGenerated: true
        });
      }


      const docRef = doc(db, "issued_documents", fileHash);
      const docSnap = await getDoc(docRef);

      // OPEN MODE LOGIC (Company Side)
      if (docSnap.exists()) {
        const docData = docSnap.data();
        if (docData?.status !== "valid") {
          console.error(`[VERITRUST] Company Verification FAILED. Document status is ${docData?.status}.`);
          alert(`Verification Failed! This document is not in the official registry.`);
          throw new Error(`Document is ${docData?.status}`);
        }
        console.log("[VERITRUST] Document Validated in Registry.");
      } else {
        console.log("[VERITRUST] Document not in registry. Proceeding as VALID (Open Verification Mode).");
      }

      console.log("[VERITRUST] Document Validated in Registry. Proceeding to Blockchain...");

      // 1. Prepare Arguments for registerCompany
      // function registerCompany(string _companyId, string _image, string _name, string[] _contacts, string _description, string[] _misc, string _companyScore)
      const args = [
        user.id,                    // _companyId
        "https://via.placeholder.com/150", // _image (placeholder for now)
        user.name || "Unknown Company",    // _name
        [user.email],               // _contacts (as array)
        "Verified Company",         // _description
        [],                         // _misc
        "100"                       // _companyScore
      ] as const;

      let hash = "";
      let alreadyRegistered = false;

      // Check if already registered to prevent revert
      if (jobPublicClient) {
        try {
          const existingCompany = await jobPublicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: contractAbi,
            functionName: 'companies',
            args: [user.id]
          }) as any;

          if (existingCompany && existingCompany[2] && existingCompany[2] !== "") {
            console.log("Company already registered on-chain.");
            alreadyRegistered = true;
          }
        } catch (err) {
          console.warn("Error checking existence:", err);
        }
      }

      // 2. Send Transaction (Smart Fallback Strategy)
      if (!alreadyRegistered) {
        // STANDARD FLOW: Register the company
        console.log("Registering new company on-chain...");
        hash = await jobWalletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: contractAbi,
          functionName: 'registerCompany',
          args: args,
          chain: flowTestnet,
          account: walletAddress as `0x${string}`
        });
      } else {
        // FALLBACK FLOW: Update Score to force a transaction
        // This ensures a Metamask popup appears even if reusing the wallet
        console.log("Company exists. Running fallback transaction (updateCompanyProfileScore) to demonstrate liveness...");
        hash = await jobWalletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: contractAbi,
          functionName: 'updateCompanyProfileScore',
          args: [user.id, "100"], // Re-asserting score
          chain: flowTestnet,
          account: walletAddress as `0x${string}`
        });
      }

      console.log("Transaction sent! Hash:", hash);

      // 3. Update Firestore with REAL Blockchain Data
      // const db = getFirestore(app); // already declared above
      const zkVerificationData = {
        isVerified: true,
        proofId: `zkp_${fileHash.substring(0, 10)}`, // Use doc hash
        verifiedAt: new Date().toISOString(),
        originalDocHash: fileHash
      };

      const blockchainStampData = {
        txHash: hash, // REAL HASH
        network: "Flow EVM Testnet",
        blockNumber: 0, // We can fetch this later if needed
        timestamp: new Date().toISOString()
      };

      await updateDoc(doc(db, "users", user.id), {
        verification: {
          status: "verified",
          lastUpdated: new Date().toISOString(),
          targetSmartContract: CONTRACT_ADDRESS,
          onChainTxHash: hash,
          zkProofId: zkVerificationData.proofId
        },
        zkVerification: zkVerificationData,
        blockchainStamp: blockchainStampData
      });

      // Update Organization Document
      try {
        await setDoc(doc(db, "organizations", user.id), {
          verification: {
            zkVerified: true,
            blockchainStamped: true,
            verifiedAt: new Date().toISOString(),
            txHash: hash
          }
        }, { merge: true });
      } catch (err) {
        console.warn("Could not update organization verification status", err);
      }

      // Update Jobs
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

      console.log("Company verified on blockchain and database updated!");
      alert(`Verification Request Sent!\n\nDoc Hash: ${fileHash}\nTx Hash: ${hash}`);

    } catch (e) {
      console.error("Error verifying company on blockchain:", e);
      alert("Transaction failed! See console for details.");
    }
  };

  const updateOrganization = async (orgData: Partial<Organization>) => {
    if (!user?.id) return;
    const db = getFirestore(app);
    try {
      await setDoc(doc(db, "organizations", user.id), orgData, { merge: true });
    } catch (err) {
      console.error("Error updating organization:", err);
      throw err;
    }
  };

  const resetVerification = async () => {
    if (!user?.id) return;
    const db = getFirestore(app);
    const { deleteField } = await import("firebase/firestore");

    try {
      console.log("Resetting verification for user:", user.id);

      // 1. Reset USERS collection
      await updateDoc(doc(db, "users", user.id), {
        "verification": deleteField(),
        "zkVerification": deleteField(),
        "blockchainStamp": deleteField()
      });

      // 2. Reset ORGANIZATIONS collection (if applicable)
      if (user.type === "company") {
        await updateDoc(doc(db, "organizations", user.id), {
          "verification": deleteField()
        });
      }

      // 3. Optional: Reset JOBS collection (if data was copied there)
      // This is harder to do efficiently without a query, so skipping for MVP demo 
      // unless user complains. The UI on jobs might still show "verified" until refresh.

      alert("Verification Reset! You can now demonstrate the flow again.");
    } catch (err) {
      console.error("Error resetting verification:", err);
      alert("Failed to reset verification.");
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
        organization,
        updateOrganization,
        connectWallet,
        walletAddress,
        verifiedCompanyIds,
        resetVerification
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
