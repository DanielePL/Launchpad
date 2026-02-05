import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Rocket } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, organization, user } = useAuth();
  const location = useLocation();

  // Not authenticated? Go to login immediately (no loading screen)
  if (!isLoading && (!isAuthenticated || !user)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Still loading? Show minimal loading (only if we think there's a session)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
          <Rocket className="h-6 w-6 text-primary animate-pulse" />
        </div>
      </div>
    );
  }

  // Authenticated but no organization? Create one
  if (!organization) {
    return <Navigate to="/onboarding/create-organization" replace />;
  }

  return <>{children}</>;
}
