import { usePrivy } from "@privy-io/react-auth";
import { Navigate } from "react-router-dom";
import { useGlobalContext } from "@/Context/useGlobalContext";

type UserRole = "candidate" | "company";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedType?: UserRole;
}

export const ProtectedRoute = ({
  children,
  allowedType,
}: ProtectedRouteProps) => {
  const { user: authUser, ready } = usePrivy();
  const { user: contextUser, loading } = useGlobalContext();

  if (!ready || loading) {
    return null; // or a loading spinner
  }

  if (!authUser) {
    return <Navigate to="/" replace />;
  }

  // Use the user from GlobalContext if available, otherwise check Privy customMetadata
  const userRole =
    contextUser?.type ||
    (authUser?.customMetadata?.role as UserRole | undefined);

  if (!userRole) {
    return <Navigate to="/option" replace />;
  }

  if (allowedType && userRole !== allowedType) {
    // const redirectPath = userRole === "candidate" ? "/candidate" : "/company";
    return <Navigate to={"/company"} replace />;
  }

  return <>{children}</>;
};
