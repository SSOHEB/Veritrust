import {
  Edit,
  Upload,
  Save,
  FileCheck,
  ShieldCheck,
  CheckCircle,
  FileText,
  Globe
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import React, { useState } from 'react';
import { useGlobalContext } from '../Context/useGlobalContext';
import type { Organization } from '../types';



const CompanyInfo: React.FC = () => {
  const { verifyCompany, user, organization, updateOrganization } = useGlobalContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Organization>>({});
  const [isVerifying, setIsVerifying] = useState(false);

  // Initialize form data when organization data loads or changes
  React.useEffect(() => {
    if (organization) {
      setFormData(organization);
    } else if (user?.type === 'company') {
      // Defaults if new
      setFormData({
        companyName: user.name || "",
        description: "",
        domain: "",
        verification: {
          zkVerified: false,
          blockchainStamped: false
        }
      });
    }
  }, [organization, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (updateOrganization) {
        await updateOrganization(formData);
        setIsEditing(false);
      }
    } catch (e) {
      console.error("Failed to save organization info", e);
    }
  };

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

  const isVerified = organization?.verification?.zkVerified;
  const zkData = organization?.verification; // Simplified for now, mapped from old model if needed
  // Note: Previous model had zkVerification distinct from verification status.
  // Our new model has verification.zkVerified.
  // If we want detailed proof data, we might need to expand Organization type or map it.

  // For MVP, we assume verifyCompany updates organization.verification.

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
                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">zkp_{organization?.id?.substr(0, 8) || "simulated"}</span>
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
                    <span className="text-slate-900 font-semibold">Simulated Ethereum</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Transaction</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded truncate max-w-[120px]">0x{organization?.id}</span>
                    </div>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-medium">Block Height</span>
                    <span className="font-mono text-slate-700 text-xs">#12345678</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Information Form */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-serif">Organization Profile</CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" /> Edit Details
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save</Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Company Name</label>
              {isEditing ? (
                <input
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              ) : (
                <p className="text-slate-700 font-semibold text-lg">{formData.companyName || "Not set"}</p>
              )}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Description</label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                />
              ) : (
                <p className="text-slate-600">{formData.description || "No description provided."}</p>
              )}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Domain / Website</label>
              {isEditing ? (
                <input
                  name="domain"
                  value={formData.domain || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="example.com"
                />
              ) : (
                <div className="flex items-center gap-2">
                  {formData.domain ? (
                    <>
                      <Globe className="w-4 h-4 text-slate-400" />
                      <a href={`https://${formData.domain}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{formData.domain}</a>
                    </>
                  ) : <span className="text-slate-400 italic">Not set</span>}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

    </div >
  );
};

export default CompanyInfo;


