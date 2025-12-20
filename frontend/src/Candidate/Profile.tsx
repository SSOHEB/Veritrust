import React, { useState } from "react";
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
} from "lucide-react";

// Mock candidate data
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

export const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  const candidate = mockCandidate;

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
      // In a real app, this would save to the backend
      console.log("Profile data:", {
        ...data,
        skills: data.skills
          .map((skill) => skill.value)
          .filter((skill) => skill.trim() !== ""),
      });
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your profile information and skills
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-semibold flex items-center space-x-2"
          >
            <Edit className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
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
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Upload Resume
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Current Resume</h4>
            <p className="text-sm text-gray-600 mb-3">
              Last updated: 2 days ago
            </p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Download PDF
            </button>
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
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Manage Portfolio
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
