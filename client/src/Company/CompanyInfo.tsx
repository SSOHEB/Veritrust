import {
  Building2,
  Globe,
  Users,
  Star,
  Edit,
  Upload,
  Save,
  X,
  FileCheck,
  ShieldCheck,
  CheckCircle,
  FileText
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import React, { useState } from 'react';
import { useGlobalContext } from '../Context/useGlobalContext';
import type { Company } from '../types';

const mockCompany: Company = {
  id: "mock-company-1",
  email: "company@example.com",
  name: "Tech Corp",
  type: "company",
  createdAt: new Date().toISOString(),
  companyName: "Tech Corp",
  industry: "Technology",
  size: "100-500",
  description: "Innovative tech solutions.",
  verification: {
    status: "unverified",
    verifiedAt: ""
  }
};

const CompanyInfo: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState<Company>(mockCompany);
  const { jobPublicClient, jobWalletClient, contractAddress, verifyCompany, user } = useGlobalContext();
  const [isVerifying, setIsVerifying] = useState(false);

  // Safe cast since this component is for Company views
  const companyUser = user?.type === 'company' ? (user as Company) : null;

  // ... form setup ...

  const handleVerificationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsVerifying(true);
      try {
        if (verifyCompany) {
          await verifyCompany();
        }
      } catch (error) {
        console.error("Verification failed", error);
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const isVerified = companyUser?.verification?.status === "verified";
  const zkData = companyUser?.zkVerification;
  const blockchainData = companyUser?.blockchainStamp;

  return (
    <div className="space-y-6">

      {/* Organization Verification Card - Recruiter View */}
      <Card className={`overflow-hidden transition-all ${isVerified ? 'border-slate-200 bg-white' : 'border-amber-200 bg-amber-50/10'}`}>
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-3 font-serif">
            <div className={`p-2 rounded-lg ${isVerified ? 'bg-emerald-100/50 text-emerald-700' : 'bg-amber-100/50 text-amber-700'}`}>
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <span className="text-slate-900 text-lg">
                Corporate Verification
              </span>
              <p className="text-sm text-slate-500 font-sans font-normal mt-0.5">
                {isVerified ? "Entity verified on simulated network" : "Verification required for listing jobs"}
              </p>
            </div>
            {isVerified && (
              <span className="ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wide">
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                OFFICIAL VERIFIED ENTITY
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {!isVerified ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-200 rounded-xl bg-white/80">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 ring-1 ring-amber-100 ring-offset-4 ring-offset-white">
                <FileCheck className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-slate-900 mb-2">Initialize Verification Protocol</h3>
              <p className="text-slate-500 text-center text-sm mb-6 max-w-md leading-relaxed">
                Upload official business registration or tax credentials. System simulates zero-knowledge proof generation and blockchain stamping.
              </p>

              <div className="relative">
                <input
                  type="file"
                  onChange={handleVerificationUpload}
                  disabled={isVerifying}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept=".pdf,.jpg,.png"
                />
                <Button disabled={isVerifying} className="bg-[#0B1F3A] hover:bg-[#1E293B] text-white px-8 h-12 rounded-lg font-medium shadow-sm transition-all relative z-0">
                  {isVerifying ? (
                    <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying Credentials...</span>
                  ) : (
                    <><Upload className="mr-2 h-4 w-4" /> Upload Business Credentials</>
                  )}
                </Button>
              </div>

              <p className="text-[10px] text-slate-400 mt-4 font-mono uppercase tracking-wider">
                Simulated zk-PDF • No Server Storage
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ZK Proof Status */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white p-2.5 rounded-lg shadow-sm border border-slate-100">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 font-serif">Credential Proof</h4>
                    <p className="text-xs text-slate-500">Zero-Knowledge Verification</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Validation Status</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded textxs">VALID</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Proof Hash</span>
                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{zkData?.proofId || "zkp_simulated"}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-medium">Timestamp</span>
                    <span className="text-slate-700 text-xs font-mono">{new Date(zkData?.verifiedAt || Date.now()).toISOString().split('T')[0]}</span>
                  </div>
                </div>
              </div>

              {/* Blockchain Stamp */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white p-2.5 rounded-lg shadow-sm border border-slate-100">
                    <Globe className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 font-serif">Registry Stamp</h4>
                    <p className="text-xs text-slate-500">Immutable Ledger Record</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Network</span>
                    <span className="text-slate-900 font-semibold">{blockchainData?.network || "Simulated Mainnet"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Transaction</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded truncate max-w-[120px]">{blockchainData?.txHash || "0x..."}</span>
                    </div>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-medium">Block Height</span>
                    <span className="font-mono text-slate-700 text-xs">#{blockchainData?.blockNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basic Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          {/* ... rest of existing Basic Information card ... */}
        </Card>
        {/* ... existing Performance card ... */}
      </div>

      {/* Existing Performance Card moved into grid above, ensure closing tags align */}

    </div >
  );
};

export default CompanyInfo;
