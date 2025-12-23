import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import type { Candidate } from "../types";
import { getFunctions, httpsCallable } from "firebase/functions";
import { doc, getFirestore, onSnapshot, setDoc } from "firebase/firestore";
import { app, auth } from "@/lib/firebase";
import { useGlobalContext } from "@/Context/useGlobalContext";
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
  Upload,
} from "lucide-react";

// Initial empty candidate
const initialCandidate: Candidate = {
  id: "",
  email: "",
  name: "",
  type: "candidate",
  createdAt: "",
  title: "",
  experience: 0,
  skills: [],
  location: "",
  bio: "",
  education: "",
  phone: "",
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

export const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user, uploadZKProof } = useGlobalContext();

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<{
    strengths: string[];
    suggestions: string[];
    exampleRewrite: string;
  } | null>(null);


  const [candidate, setCandidate] = useState<Candidate>(initialCandidate);

  // Sync candidate data from Firestore
  useEffect(() => {
    if (!user?.id) {
      setCandidate(initialCandidate);
      return;
    }

    const db = getFirestore(app);
    // Use user.id from GlobalContext (trusted source)
    const userRef = doc(db, "users", user.id);

    const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Update candidate state
        setCandidate({ ...initialCandidate, ...data } as Candidate);

        // Also handle AI feedback from the same document if present
        if (data.aiProfileFeedback) {
          const saved = data.aiProfileFeedback;
          const strengths = Array.isArray(saved.strengths)
            ? saved.strengths.filter((s: unknown) => typeof s === "string")
            : [];
          const suggestions = Array.isArray(saved.suggestions)
            ? saved.suggestions.filter((s: unknown) => typeof s === "string")
            : [];
          const exampleRewrite =
            typeof saved.exampleRewrite === "string" ? saved.exampleRewrite : "";

          setAiFeedback({ strengths, suggestions, exampleRewrite });


        }
      }
    }, (error) => {
      console.error("Profile listener error:", error);
    });

    return () => unsubscribeSnapshot();
  }, [user?.id]); // Only re-run if user ID changes

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: "",
      title: candidate.title ?? "",
      bio: candidate.bio ?? "",
      location: candidate.location ?? "",
      experience: candidate.experience ?? 0,
      education: "",
      phone: candidate.phone || "",
      skills: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  // Update form default values when candidate data changes
  // We only reset if NOT editing to avoid overwriting user input, 
  // OR we can rely on the fact that when we save, isEditing becomes false, 
  // and then this effect will run to update the "view" mode, 
  // and next time "edit" is clicked, reset() (from handleEditClick mostly) should handle it.
  // Ideally, react-hook-form 'defaultValues' is only initial. 
  // To update form with new data, we need reset().
  useEffect(() => {
    if (!isEditing && candidate.name) {
      reset({
        name: candidate.name ?? "",
        title: candidate.title ?? "",
        bio: candidate.bio ?? "",
        location: candidate.location ?? "",
        experience: candidate.experience ?? 0,
        education: typeof candidate.education === 'string' ? candidate.education : (Array.isArray(candidate.education) ? candidate.education[0] : "") ?? "",
        phone: candidate.phone || "",
        skills: (candidate.skills ?? []).map((skill) => ({ value: skill })),
      });
    }
  }, [candidate, isEditing, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.error("User not authenticated");
        return;
      }

      const db = getFirestore(app);
      const userRef = doc(db, "users", uid);

      const profileData = {
        name: data.name,
        title: data.title,
        bio: data.bio,
        location: data.location,
        experience: Number(data.experience),
        education: data.education,
        phone: data.phone,
        skills: (data.skills ?? [])
          .map((skill) => skill.value)
          .filter((skill) => skill.trim() !== ""),
        updatedAt: new Date().toISOString(),
      };

      // Merge with existing data
      await setDoc(userRef, profileData, { merge: true });

      console.log("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const addSkill = () => {
    append({ value: "" });
  };

  const handleGetAiSuggestions = async () => {
    setAiError(null);
    setAiFeedback(null);
    setAiLoading(true);

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setAiError("Please sign in to use AI profile feedback.");
        return;
      }

      const values = getValues();
      const skills = (values.skills ?? [])
        .map((s) => s.value)
        .filter((s) => typeof s === "string" && s.trim() !== "")
        .join(", ");

      const profileText = [
        values.title ? `Title: ${values.title}` : "",
        `Experience: ${values.experience ?? 0} years`,
        values.education ? `Education: ${values.education}` : "",
        skills ? `Skills: ${skills}` : "",
        values.bio ? `Bio: ${values.bio}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const functions = getFunctions(app);
      const callable = httpsCallable<
        { profileText: string },
        { strengths: string[]; suggestions: string[]; exampleRewrite: string }
      >(functions, "generateProfileFeedback");

      const result = await callable({ profileText });
      setAiFeedback(result.data);

    } catch {
      setAiError("AI service is temporarily unavailable. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto space-y-8">
      {/* Page Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-teal-900">Verified Profile</h1>
          <p className="text-teal-700/80 mt-1 font-medium">Manage your verified academic identity and skills</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all font-semibold flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-xl hover:bg-slate-50 transition-all font-semibold flex items-center space-x-2 shadow-sm disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Hero Profile Header */}
      <div className="bg-white rounded-2xl shadow-md border border-teal-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="h-32 bg-gradient-to-r from-teal-600 to-emerald-500"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="flex items-end space-x-6">
              <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center text-teal-700 border border-teal-200">
                  <span className="text-4xl font-serif font-bold">
                    {(candidate.name ?? "")
                      .split(" ")
                      .filter(Boolean)
                      .map((n) => n.charAt(0))
                      .join("") || <User className="w-12 h-12" />}
                  </span>
                </div>
              </div>
              <div className="pb-2">
                {isEditing ? (
                  <div className="flex flex-col space-y-3 mb-2">
                    <input
                      type="text"
                      {...register("name", { required: "Name is required" })}
                      className="text-3xl font-serif font-bold text-slate-900 bg-transparent border-b-2 border-slate-300 focus:border-teal-500 outline-none w-full placeholder:text-slate-300"
                      placeholder="Full Name"
                    />
                    {errors.name && (
                      <p className="text-rose-500 text-sm">{errors.name.message}</p>
                    )}
                    <input
                      type="text"
                      {...register("title", { required: "Title is required" })}
                      className="text-lg font-medium text-slate-600 bg-transparent border-b border-slate-300 focus:border-teal-500 outline-none w-full placeholder:text-slate-300"
                      placeholder="Professional Title"
                    />
                    {errors.title && (
                      <p className="text-rose-500 text-sm">{errors.title.message}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">
                      {candidate.name || "Student Name"}
                    </h1>
                    <p className="text-lg font-medium text-teal-700/90 mt-1">{candidate.title || "Student Title"}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Badge - Hero Position */}
            {candidate.zkVerification?.isVerified && (
              <div className="hidden md:flex flex-col items-end mb-3">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full shadow-sm text-emerald-800 font-bold text-sm tracking-wide">
                  <ShieldCheck className="w-5 h-5" />
                  <span>OFFICIAL VERIFIED STUDENT</span>
                </div>
                <p className="text-xs text-emerald-600/80 mt-1 font-medium mr-2">Via zkPDF Protocol</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium">{candidate.email || "No email"}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center space-x-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium">{candidate.phone}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              {isEditing ? (
                <input
                  type="text"
                  {...register("location")}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-sm outline-none focus:border-teal-500"
                  placeholder="City, Country"
                />
              ) : (
                <span className="text-sm font-medium">{candidate.location || "Location not set"}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Basic Info & Documents */}
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2 bg-teal-50 rounded-lg">
                <User className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-900">
                About Me
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Biography
                </label>
                {isEditing ? (
                  <textarea
                    {...register("bio")}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-shadow"
                    placeholder="Tell us about your academic journey..."
                  />
                ) : (
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {candidate.bio || "No biography provided yet."}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Experience
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="number"
                        {...register("experience", {
                          required: "Required",
                          min: 0,
                        })}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <Briefcase className="w-5 h-5 text-teal-600/70" />
                      <span>{candidate.experience ?? 0} Years Experience</span>
                    </div>
                  )}
                  {errors.experience && (
                    <p className="text-rose-500 text-xs mt-1">{errors.experience.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Education
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="text"
                        {...register("education", {
                          required: "Required",
                        })}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                        placeholder="University..."
                      />
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <GraduationCap className="w-5 h-5 text-teal-600/70" />
                      <span className="truncate">{typeof candidate.education === 'string' ? candidate.education : (Array.isArray(candidate.education) ? candidate.education[0] : "") ?? "Not specified"}</span>
                    </div>
                  )}
                  {errors.education && (
                    <p className="text-rose-500 text-xs mt-1">{errors.education.message}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    {...register("phone")}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900">
                  Identity Verification
                </h3>
              </div>
              {candidate.zkVerification?.isVerified ? (
                <div className="flex flex-col items-end">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs border border-emerald-200 tracking-wide flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    VERIFIED
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono">{candidate.zkVerification.verifiedAt ? new Date(candidate.zkVerification.verifiedAt).toLocaleDateString() : ""}</span>
                </div>
              ) : (
                <label className={`cursor-pointer px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-semibold text-sm flex items-center gap-2 shadow-sm hover:translate-y-[-1px] ${isVerifying ? 'opacity-75 cursor-not-allowed' : ''}`}>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    disabled={isVerifying}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file && user?.id) {
                        try {
                          setIsVerifying(true);
                          await uploadZKProof(
                            "resume_verification",
                            "resume",
                            file,
                            "candidate",
                            "Candidate Resume"
                          );
                          // No need to manually set candidate state here as the onSnapshot listener will pick up the change
                        } catch (err) {
                          console.error(err);
                          alert("Verification failed. Please try again.");
                        } finally {
                          setIsVerifying(false);
                        }
                      }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Resume / Certificate</span>
                      </>
                    )}
                  </div>
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Document Items - Stacking vertical for clarity */}
              <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:border-teal-200 hover:bg-teal-50/30 transition-colors cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500 font-bold text-xs border border-rose-100">PDF</div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Official Transcript</h4>
                    <p className="text-xs text-slate-500">Verified on-chain</p>
                  </div>
                </div>
                <button className="text-teal-700 text-sm font-semibold hover:underline">View</button>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:border-teal-200 hover:bg-teal-50/30 transition-colors cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 font-bold text-xs border border-blue-100">PDF</div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Resume / CV</h4>
                    <p className="text-xs text-slate-500">Last updated: 2d ago</p>
                  </div>
                </div>
                <button className="text-teal-700 text-sm font-semibold hover:underline">Update</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Skills & AI */}
        <div className="space-y-8">
          {/* Skills */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900">
                  Skills & Expertise
                </h3>
              </div>
              {isEditing && (
                <button
                  onClick={addSkill}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Skill
                </button>
              )}
            </div>

            <div className="min-h-[100px]">
              {isEditing ? (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        {...register(`skills.${index}.value` as const, {
                          required: "Required",
                        })}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                        placeholder="Skill (e.g. React Native)"
                      />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <p className="text-slate-400 text-sm italic text-center py-4">Add skills to showcase your expertise</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(candidate.skills ?? []).length > 0 ? (
                    (candidate.skills ?? []).map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold rounded-lg shadow-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm italic">No skills added yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI Assistant */}
          <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl shadow-md border border-indigo-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex items-start justify-between mb-6 relative z-10">
              <div>
                <h3 className="text-lg font-serif font-bold text-indigo-900 flex items-center gap-2">
                  <span className="text-2xl">✨</span> AI Profile Assistant
                </h3>
                <p className="text-sm text-indigo-700/80 mt-1 max-w-xs font-medium">
                  Powered by Google Gemini to refine your professional story.
                </p>
              </div>
            </div>

            <div className="relative z-10">
              {!aiFeedback ? (
                <div className="text-center py-6">
                  <button
                    type="button"
                    onClick={handleGetAiSuggestions}
                    disabled={aiLoading}
                    className="w-full py-3 bg-white text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all font-bold shadow-sm hover:shadow-md disabled:opacity-70"
                  >
                    {aiLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        Analyzing Profile...
                      </span>
                    ) : "Generate AI Feedback"}
                  </button>
                  <p className="text-xs text-indigo-400 mt-3">
                    Suggestions are private and advisory only.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {aiError && (
                    <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-100">
                      {aiError}
                    </div>
                  )}

                  <div className="bg-white/80 rounded-xl p-4 border border-indigo-100 shadow-sm">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Key Strengths</h4>
                    <ul className="space-y-2">
                      {aiFeedback.strengths.slice(0, 3).map((s, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/80 rounded-xl p-4 border border-indigo-100 shadow-sm">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Suggestions</h4>
                    <ul className="space-y-2">
                      {aiFeedback.suggestions.slice(0, 3).map((s, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleGetAiSuggestions}
                      className="w-full py-2 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      Refresh AI Analysis
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form >

  );
};
