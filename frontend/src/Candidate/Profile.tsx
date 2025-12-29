import React, { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import type { Candidate } from "../types";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Edit,
  Save,
  X,
  Plus,
  Star,
  ShieldCheck,
  Loader,
  AlertCircle,
} from "lucide-react";
import { app } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions } from "@/lib/firebase";

// Mock candidate data (fallback)
const mockCandidate: Candidate = {
  id: "2",
  email: "john.developer@example.com",
  name: "John Developer",
  type: "candidate",
  createdAt: "2024-01-01",
  title: "Senior Frontend Developer",
  experience: 5,
  skills: ["React", "TypeScript", "Node.js", "JavaScript", "CSS", "HTML"],
  location: "San Francisco, CA",
  bio: "Passionate full-stack developer with 5+ years of experience in React and modern web technologies. Love building user-friendly applications and learning new technologies.",
  education: "BS Computer Science - Stanford University",
  phone: "+1-555-0123",
};

type ProfileFormData = {
  name: string;
  title: string;
  bio: string;
  location: string;
  experience: number;
  education: string;
  phone?: string;
  skills: { value: string }[];
};

interface UserProfile extends Candidate {
  verified?: boolean;
  verifiedAt?: string;
  verificationMethod?: "zk-simulation";
}

export const Profile: React.FC = () => {
  const auth = useMemo(() => getAuth(app), []);
  const db = useMemo(() => getFirestore(app), []);
  const storage = useMemo(() => getStorage(app), []);
  const functions = useMemo(() => getFirebaseFunctions(), []);

  const [isEditing, setIsEditing] = useState(false);
  const [candidate, setCandidate] = useState<UserProfile>(mockCandidate);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [gettingAIFeedback, setGettingAIFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{
    strengths?: string[];
    suggestions?: string[];
    exampleRewrite?: string;
  } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        setError(null);
        setLoading(true);

        if (!user) {
          setCandidate(mockCandidate);
          setError("You must be signed in to view your profile.");
          return;
        }

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as Partial<UserProfile>;
          setCandidate({
            id: user.uid,
            email: user.email || data.email || "",
            name: user.displayName || data.name || "",
            type: "candidate",
            createdAt: data.createdAt || new Date().toISOString(),
            title: data.title || "",
            experience: data.experience || 0,
            skills: data.skills || [],
            location: data.location || "",
            bio: data.bio || "",
            education: data.education || "",
            phone: data.phone || "",
            verified: data.verified || false,
            verifiedAt: data.verifiedAt,
            verificationMethod: data.verificationMethod,
          });
          return;
        }

        const initial: UserProfile = {
          id: user.uid,
          email: user.email || "",
          name: user.displayName || "",
          type: "candidate",
          createdAt: new Date().toISOString(),
          title: "",
          experience: 0,
          skills: [],
          location: "",
          bio: "",
          education: "",
          phone: "",
          verified: false,
        };

        await setDoc(ref, initial, { merge: true });
        setCandidate(initial);
      } catch (e) {
        console.error(e);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [auth, db]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: candidate.name,
      title: candidate.title,
      bio: candidate.bio,
      location: candidate.location,
      experience: candidate.experience,
      education: candidate.education,
      phone: candidate.phone || "",
      skills: candidate.skills.map((skill) => ({ value: skill })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setError(null);

      const user = auth.currentUser;
      if (!user) {
        setError("You must be signed in to save your profile.");
        return;
      }

      const ref = doc(db, "users", user.uid);
      const payload = {
        ...candidate,
        name: data.name,
        title: data.title,
        bio: data.bio,
        location: data.location,
        experience: data.experience,
        education: data.education,
        phone: data.phone,
        skills: data.skills
          .map((skill) => skill.value)
          .filter((skill) => skill.trim() !== ""),
      };

      await setDoc(ref, payload, { merge: true });
      setCandidate(payload as UserProfile);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Failed to save profile.");
    }
  };

  const handleVerify = async () => {
    try {
      setError(null);
      setVerifying(true);

      const user = auth.currentUser;
      if (!user) {
        setError("You must be signed in to verify your profile.");
        return;
      }

      const ref = doc(db, "users", user.uid);
      const verificationData = {
        verified: true,
        verifiedAt: new Date().toISOString(),
        verificationMethod: "zk-simulation",
      };

      await setDoc(ref, verificationData, { merge: true });
      setCandidate((prev) => ({ ...prev, ...verificationData }));
    } catch (error) {
      console.error("Error verifying profile:", error);
      setError("Failed to verify profile.");
    } finally {
      setVerifying(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: "resume" | "portfolio"
  ) => {
    try {
      setError(null);
      setUploading(true);

      const user = auth.currentUser;
      if (!user) {
        setError("You must be signed in to upload files.");
        return;
      }

      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      // Upload to Firebase Storage
      const fileRef = ref(
        storage,
        `users/${user.uid}/${fileType}/${file.name}`
      );
      await uploadBytes(fileRef, file);

      // Get download URL
      const url = await getDownloadURL(fileRef);

      // Save to Firestore
      const userRef = doc(db, "users", user.uid);
      const updateData: Record<string, string | { url: string; updatedAt: string }> = {};
      updateData[fileType] = {
        url,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userRef, updateData, { merge: true });

      if (fileType === "resume") {
        setResumeUrl(url);
      }

      setError(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(`Failed to upload ${fileType}.`);
    } finally {
      setUploading(false);
    }
  };

  const handleGetAIFeedback = async () => {
    try {
      setError(null);
      setGettingAIFeedback(true);

      const user = auth.currentUser;
      if (!user) {
        setError("You must be signed in to get AI feedback.");
        return;
      }

      // Prepare profile text for analysis
      const profileText = `
Name: ${candidate.name}
Title: ${candidate.title}
Bio: ${candidate.bio}
Experience: ${candidate.experience} years
Education: ${candidate.education}
Skills: ${candidate.skills.join(", ")}
Location: ${candidate.location}
      `.trim();

      // Call Cloud Function
      const generateProfileFeedback = httpsCallable(
        functions,
        "generateProfileFeedback"
      );
      const result = await generateProfileFeedback({ profileText });

      const feedbackData = result.data as {
        strengths?: string[];
        suggestions?: string[];
        exampleRewrite?: string;
      };
      setAiFeedback(feedbackData);
    } catch (error) {
      console.error("Error getting AI feedback:", error);
      setError("Failed to get AI feedback. Please try again.");
    } finally {
      setGettingAIFeedback(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const addSkill = () => {
    append({ value: "" });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-100">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your profile information and skills
          </p>
        </div>
        {!isEditing ? (
          <div className="flex items-center space-x-3">
            {candidate.verified && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">Verified Student</span>
              </div>
            )}
            {!candidate.verified && (
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifying}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all font-semibold flex items-center space-x-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{verifying ? "Verifying..." : "Verify My Profile"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-semibold flex items-center space-x-2"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
          </div>
        ) : (
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{isSubmitting ? "Saving..." : "Save"}</span>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center space-x-2 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {candidate.name
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")}
            </span>
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="flex flex-col space-y-5">
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none w-fit"
                  placeholder="Full Name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
                <input
                  type="text"
                  {...register("title", { required: "Title is required" })}
                  className="text-lg text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none min-w-fit max-w-md"
                  placeholder="Professional Title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {candidate.name}
                </h1>
                <p className="text-lg text-gray-600 mt-1">{candidate.title}</p>
              </div>
            )}

            <div className="flex items-center space-x-6 mt-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                {isEditing ? (
                  <input
                    type="text"
                    {...register("location")}
                    className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                    placeholder="Location"
                  />
                ) : (
                  <span>{candidate.location}</span>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center space-x-1 mb-1">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">4.8</span>
            </div>
            <p className="text-sm text-gray-600">Profile Score</p>
          </div>
        </div>
      </div>

      {/* Main Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  {...register("bio")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-600">{candidate.bio}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    {...register("experience", {
                      required: "Experience is required",
                      min: {
                        value: 0,
                        message: "Experience cannot be negative",
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">
                      {candidate.experience} years
                    </span>
                  </div>
                )}
                {errors.experience && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.experience.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    {...register("education", {
                      required: "Education is required",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., BS Computer Science"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{candidate.education}</span>
                  </div>
                )}
                {errors.education && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.education.message}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phone number"
                />
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Star className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Skills & Expertise
              </h3>
            </div>
            {isEditing && (
              <button
                onClick={addSkill}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {isEditing ? (
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2 ">
                    <input
                      type="text"
                      {...register(`skills.${index}.value` as const, {
                        required: "Skill cannot be empty",
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Skill name"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {fields.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    No skills added yet. Click "Add Skill" to get started.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Skill Assessment
              </h4>
              <div className="space-y-2">
                {candidate.skills.slice(0, 3).map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700">{skill}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${Math.floor(Math.random() * 30) + 70}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-12">Expert</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resume Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Briefcase className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Resume & Documents
            </h3>
          </div>
          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium">
            {uploading ? "Uploading..." : "Upload Resume"}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileUpload(e, "resume")}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Current Resume</h4>
            <p className="text-sm text-gray-600 mb-3">
              {resumeUrl
                ? "Resume uploaded"
                : "Last updated: 2 days ago"}
            </p>
            {resumeUrl ? (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Download PDF
              </a>
            ) : (
              <p className="text-gray-500 text-sm">No resume uploaded yet</p>
            )}
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
            <p className="text-sm text-gray-600 mb-3">Template ready</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Template
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Portfolio</h4>
            <p className="text-sm text-gray-600 mb-3">3 projects linked</p>
            <label className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer">
              Manage Portfolio
              <input
                type="file"
                accept=".pdf,.zip"
                onChange={(e) => handleFileUpload(e, "portfolio")}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* AI Feedback Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Star className="w-6 h-6 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              AI Profile Review
            </h3>
          </div>
          <button
            onClick={handleGetAIFeedback}
            disabled={gettingAIFeedback}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 font-medium"
          >
            {gettingAIFeedback ? "Analyzing..." : "Get AI Feedback"}
          </button>
        </div>

        {aiFeedback ? (
          <div className="space-y-4">
            {aiFeedback.strengths && aiFeedback.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-700 mb-2">✓ Strengths</h4>
                <ul className="space-y-1">
                  {aiFeedback.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      • {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiFeedback.suggestions && aiFeedback.suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">💡 Suggestions</h4>
                <ul className="space-y-1">
                  {aiFeedback.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      • {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiFeedback.exampleRewrite && (
              <div>
                <h4 className="font-semibold text-purple-700 mb-2">
                  📝 Example Rewrite
                </h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg italic">
                  {aiFeedback.exampleRewrite}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">
              Get personalized AI-powered feedback on your profile to improve your chances with recruiters.
            </p>
          </div>
        )}
      </div>
    </form>
  );
};
