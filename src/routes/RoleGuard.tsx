import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/api/types/auth";
import type { Permission } from "@/api/types/permissions";
import { Lock } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

/**
 * Role-based route guard.
 * Redirects to fallbackPath if user doesn't have required role.
 * Admin users always have access to all routes.
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallbackPath = "/",
}: RoleGuardProps) {
  const { user, isAuthenticated, hasRole } = useAuth();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (!hasRole(allowedRoles)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
  superAdminOnly?: boolean;
  showAccessDenied?: boolean;
}

/**
 * Permission-based route guard.
 * Shows access denied message or redirects if user doesn't have required permission.
 * Super admin always has access.
 */
export function PermissionGuard({
  children,
  permission,
  superAdminOnly = false,
  showAccessDenied = true,
}: PermissionGuardProps) {
  const { hasPermission, isSuperAdmin } = useAuth();

  // Check super admin requirement
  if (superAdminOnly && !isSuperAdmin) {
    if (showAccessDenied) {
      return <AccessDenied message="Only Super Admin has access to this page." />;
    }
    return <Navigate to="/" replace />;
  }

  // Check permission
  if (!hasPermission(permission)) {
    if (showAccessDenied) {
      return <AccessDenied message="You don't have permission for this page." />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AccessDenied({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Lock className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h2 className="text-xl font-semibold">Access denied</h2>
      <p className="text-muted-foreground mt-2">{message}</p>
    </div>
  );
}
