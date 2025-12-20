import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  FileText,
  Check,
  X,
  Upload,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Type definitions for ApplicationCard
interface ProofDocument {
  name: string;
  uploadDate: string;
}

interface CompanyAction {
  status: string;
  actionDate: string;
  proofDocument?: ProofDocument;
}

interface Candidate {
  name: string;
  candidateId: string;
}

interface Job {
  title: string;
  location: string;
}

interface Company {
  companyName: string;
}

interface Application {
  id: string;
  job: Job;
  company?: Company;
  candidate: Candidate;
  status: string;
  appliedAt: string;
  companyAction?: CompanyAction;
  candidateVerified?: boolean;
  verificationDate?: string;
}

interface ApplicationCardProps {
  application: Application;
  userRole: "candidate" | "company";
  onStatusChange: (
    id: string,
    status:
      | "approved"
      | "rejected"
      | "reviewed"
      | "pending"
      | "pending for proof"
  ) => void;
  onFileUpload: (id: string, file: File) => void;
  onVerify: (id: string) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  userRole,
  onStatusChange,
  onFileUpload,
  onVerify,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "verified":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onFileUpload(application.id, file);
    }
  };

  // Company can take actions when status is pending
  const canShowCompanyActions =
    userRole === "company" && application.status === "pending";

  // Company can upload proof document after approving (but before candidate verifies)
  const canShowFileUpload =
    userRole === "company" &&
    application.status === "approved" &&
    !application.companyAction?.proofDocument;

  // Candidate can verify when status is 'pending for proof' (after company uploads proof)
  const canShowVerificationPendingProof =
    userRole === "candidate" && application.status === "pending for proof";
  // Candidate can verify when there's a proof document and status is approved

  console.log(
    "canShowVerificationPendingProof:",
    canShowVerificationPendingProof
  );
  const canShowVerification =
    userRole === "candidate" &&
    application.status === "approved" &&
    application.companyAction?.proofDocument;

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  // For candidate proof modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [candidateProofText, setCandidateProofText] = useState("");
  const [isProving, setIsProving] = useState(false);

  async function generatePDFProof(
    file: File,
    options = {} as {
      pageNumber?: number;
      offset?: number;
      subString?: string;
      apiUrl?: string;
    }
  ) {
    const {
      pageNumber = 0,
      offset = 0,
      subString = "",
      apiUrl = "http://localhost:3001/prove",
    } = options;
    // Validate input
    if (!file) {
      throw new Error("No file provided");
    }

    if (file.type !== "application/pdf") {
      throw new Error("File must be a PDF");
    }

    try {
      // Convert file to bytes array
      const buffer = await file.arrayBuffer();
      const pdfBytes = Array.from(new Uint8Array(buffer));

      // Make API request with all required fields
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdf_bytes: pdfBytes,
          page_number: pageNumber,
          offset: offset,
          sub_string: subString,
        }),
      });

      // Check response status
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse and return proof data
      const proofData = await response.json();
      return proofData;
    } catch (error: any) {
      // Handle specific error types
      if (
        error.message.includes("fetch") ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("ECONNREFUSED")
      ) {
        throw new Error(
          "Prover API is not running. Please start the server at " + apiUrl
        );
      }

      // Re-throw other errors
      throw error;
    }
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {application.job.title}
          </h3>
          <p className="text-gray-600 font-medium">
            {application.company?.companyName || "-"}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
            application.status
          )}`}
        >
          {application.status.charAt(0).toUpperCase() +
            application.status.slice(1)}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{application.job.location || "-"}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>
            Applied {new Date(application.appliedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Show applicant info for both roles but with different labels */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">
            {userRole === "candidate" ? "Candidate" : "Applicant"}:
          </span>{" "}
          {application?.candidate.name || "-"}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Email:</span>{" "}
          {application.candidate.candidateId || "-"}
        </p>
      </div>

      {/* Company Actions - Only show when status is pending */}
      {canShowCompanyActions && (
        <div className="mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Application & Upload Proof</DialogTitle>
                <DialogDescription>
                  <div className="my-4">
                    <label className="block mb-3 text-sm font-medium text-gray-700">
                      Upload Proof Document (PDF)
                    </label>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        file
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                      }`}
                      onDrop={(e) => {
                        e.preventDefault();
                        const droppedFile = e.dataTransfer.files?.[0];
                        if (
                          droppedFile &&
                          droppedFile.type === "application/pdf"
                        ) {
                          setFile(droppedFile);
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f && f.type === "application/pdf") setFile(f);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {!file ? (
                        <div className="space-y-3">
                          <div className="flex justify-center">
                            <Upload className="w-12 h-12 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-700 mb-1">
                              Drop your PDF here
                            </p>
                            <p className="text-sm text-gray-500">
                              or{" "}
                              <span className="text-blue-600 underline">
                                click to browse
                              </span>
                            </p>
                          </div>
                          <p className="text-xs text-gray-400">
                            Only PDF files are supported
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-center">
                            <FileText className="w-12 h-12 text-green-600" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-green-700 mb-1">
                              {file.name}
                            </p>
                            <p className="text-sm text-green-600">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                            }}
                            className="text-sm text-red-600 hover:text-red-700 underline"
                          >
                            Remove file
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    disabled={!file || isGeneratingProof || isUpdatingStatus}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
                    onClick={async () => {
                      if (!file) return;
                      setIsGeneratingProof(true);
                      // Simulate proof generation
                      await generatePDFProof(file);
                      //
                      setIsGeneratingProof(false);
                      setIsUpdatingStatus(true);
                      // Call blockchain (simulate with status update)
                      onFileUpload(application.id, file!);
                      onStatusChange(application.id, "pending for proof");
                      setIsUpdatingStatus(false);
                      setOpen(false);
                      setFile(null);
                    }}
                  >
                    {isGeneratingProof
                      ? "Generating Proof... (wait 60s)"
                      : isUpdatingStatus
                      ? "Updating Status..."
                      : "Approve & Upload"}
                  </button>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Review Application:
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
            >
              <Check className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => onStatusChange(application.id, "rejected")}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      )}

      {/* File Upload for Company - Show after approval */}
      {canShowFileUpload && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Upload Proof Document (PDF)
          </p>
          <div
            className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-colors"
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files?.[0];
              if (droppedFile && droppedFile.type === "application/pdf") {
                handleFileUpload({ target: { files: [droppedFile] } } as any);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDragEnter={(e) => {
              e.preventDefault();
            }}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2">
              <div className="flex justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Drop your PDF here or{" "}
                <span className="text-blue-600 underline">click to browse</span>
              </p>
              <p className="text-xs text-gray-500">
                Only PDF files are supported
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show uploaded document */}
      {application.companyAction?.proofDocument && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-700">
              {application.companyAction.proofDocument.name}
            </span>
            <button className="ml-auto flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors">
              <Eye className="w-4 h-4" />
              View
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Uploaded{" "}
            {new Date(
              application.companyAction.proofDocument.uploadDate
            ).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Candidate Verification - Show button, then modal with input, for 'pending for proof' */}
      {canShowVerificationPendingProof && (
        <>
          <button
            onClick={() => setVerifyModalOpen(true)}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            Verify Proof & Approve
          </button>
          <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify Proof</DialogTitle>
                <DialogDescription>
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 mb-3">
                      Please enter the string you want to prove and verify your
                      application.
                    </p>
                    <input
                      type="text"
                      placeholder="Enter text to prove..."
                      value={candidateProofText}
                      onChange={(e) => setCandidateProofText(e.target.value)}
                      className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={isProving}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      setIsProving(true);
                      await new Promise((res) => setTimeout(res, 10000));
                      setIsProving(false);
                      setVerifyModalOpen(false);
                      // Call blockchain to update status to approved
                      onStatusChange(application.id, "approved");
                    }}
                    disabled={!candidateProofText || isProving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    {isProving ? "Verifying... (wait 10s)" : "Submit & Verify"}
                  </button>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Status Messages for Different Scenarios */}
      {application.status === "approved" &&
        userRole === "company" &&
        !application.companyAction?.proofDocument && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <span className="font-medium">Action Required:</span> Please
              upload the proof document to complete the approval process.
            </p>
          </div>
        )}

      {/* {application.status === "approved" &&
        userRole === "candidate" &&
        !application.companyAction?.proofDocument && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Waiting:</span> Company is preparing
              the proof document.
            </p>
          </div>
        )} */}

      {application.status === "verified" && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Complete:</span> Application has been
            verified and finalized.
          </p>
        </div>
      )}

      {application.status === "rejected" && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-800">
            <span className="font-medium">Rejected:</span> This application was
            not approved.
          </p>
        </div>
      )}

      {/* Status History */}
      {(application.companyAction || application.candidateVerified) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Status Timeline
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Application submitted</span>
              <span>
                {new Date(application.appliedAt).toLocaleDateString()}
              </span>
            </div>
            {application.companyAction && (
              <div className="flex justify-between text-xs text-gray-600">
                <span>
                  Company {application.companyAction.status} application
                </span>
                <span>
                  {new Date(
                    application.companyAction.actionDate
                  ).toLocaleDateString()}
                </span>
              </div>
            )}
            {/* {application.companyAction?.proofDocument && (
              <div className="flex justify-between text-xs text-gray-600">
                <span>Proof document uploaded</span>
                <span>
                  {new Date(
                    application.companyAction.proofDocument.uploadDate
                  ).toLocaleDateString()}
                </span>
              </div>
            )} */}
            {application.candidateVerified && application.verificationDate && (
              <div className="flex justify-between text-xs text-gray-600">
                <span>Verified by candidate</span>
                <span>
                  {new Date(application.verificationDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationCard;
