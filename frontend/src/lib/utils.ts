import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const JobType: Record<
  number,
  "full-time" | "part-time" | "contract" | "internship" | "freelance"
> = {
  0: "full-time",
  1: "part-time",
  2: "contract",
  3: "internship",
  4: "freelance",
};

export const LocationType: Record<number, "remote" | "onsite" | "hybrid"> = {
  0: "remote",
  1: "onsite",
  2: "hybrid",
};

export const JobStatus: Record<number, "active" | "inactive"> = {
  0: "active",
  1: "inactive",
};
