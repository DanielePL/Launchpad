import { Navigate } from "react-router-dom";
import { isPartnerAuthenticated } from "@/api/partnerClient";

interface CreatorProtectedRouteProps {
  children: React.ReactNode;
}

export function CreatorProtectedRoute({ children }: CreatorProtectedRouteProps) {
  if (!isPartnerAuthenticated()) {
    return <Navigate to="/creator/login" replace />;
  }

  return <>{children}</>;
}
