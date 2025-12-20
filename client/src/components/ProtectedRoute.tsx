import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { User } from "firebase/auth";
import { onAuthChange } from "@/lib/auth";

type UserRole = "candidate" | "company";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedType?: UserRole;
}

export const ProtectedRoute = ({ children, allowedType }: ProtectedRouteProps) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null | undefined>(
    undefined
  );

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => setFirebaseUser(u));
    return unsubscribe;
  }, []);

  // Avoid flashing protected content while auth state initializes.
  if (firebaseUser === undefined) return null;

  if (!firebaseUser) {
    return <Navigate to="/" replace />;
  }

  const role = (localStorage.getItem("role") as UserRole | null) ?? null;

  if (!role) {
    return <Navigate to="/option" replace />;
  }

  if (allowedType && role !== allowedType) {
    return <Navigate to={role === "candidate" ? "/candidate" : "/company"} replace />;
  }

  return <>{children}</>;
};
