import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, UserRole } from "@/api/types/auth";
import {
  type Permission,
  type SensitivePermission,
  type AdminPermissions,
  ADMIN_EMAILS,
  isValidAdminEmail,
  isSuperAdmin as checkIsSuperAdmin,
  hasPermission as checkHasPermission,
  hasSensitivePermission as checkHasSensitivePermission,
} from "@/api/types/permissions";

// Storage key for permissions
const PERMISSIONS_STORAGE_KEY = "admin_permissions";

// Default permissions for new accounts
const DEFAULT_PERMISSIONS: Permission[] = ["dashboard"];

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isSalesUser: boolean;
  isInfluencerManager: boolean;
  isInfluencer: boolean;
  canAccessCRM: boolean;
  canAccessInfluencers: boolean;

  // Permission-based access
  permissions: Permission[];
  sensitivePermissions: SensitivePermission[];
  hasPermission: (permission: Permission) => boolean;
  hasSensitivePermission: (permission: SensitivePermission) => boolean;

  // Permission management (super admin only)
  getAllAdminPermissions: () => AdminPermissions[];
  updateAdminPermissions: (email: string, permissions: Permission[], sensitivePermissions: SensitivePermission[]) => void;

  hasRole: (role: UserRole | UserRole[]) => boolean;
  login: (email: string, userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Load permissions from localStorage
function loadStoredPermissions(): Record<string, AdminPermissions> {
  try {
    const stored = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load permissions:", e);
  }

  // Initialize with default permissions for admin and campus
  const defaults: Record<string, AdminPermissions> = {
    [ADMIN_EMAILS.ADMIN]: {
      email: ADMIN_EMAILS.ADMIN,
      permissions: [...DEFAULT_PERMISSIONS],
      sensitive_permissions: [],
      updated_at: new Date().toISOString(),
      updated_by: ADMIN_EMAILS.SUPER_ADMIN,
    },
    [ADMIN_EMAILS.CAMPUS]: {
      email: ADMIN_EMAILS.CAMPUS,
      permissions: [...DEFAULT_PERMISSIONS],
      sensitive_permissions: [],
      updated_at: new Date().toISOString(),
      updated_by: ADMIN_EMAILS.SUPER_ADMIN,
    },
  };

  localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

// Save permissions to localStorage
function saveStoredPermissions(permissions: Record<string, AdminPermissions>): void {
  localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // For now, simulate login with management email (super admin)
  // In production, this would come from actual authentication
  const [user] = useState<User | null>({
    id: "admin",
    email: ADMIN_EMAILS.SUPER_ADMIN, // Change this to test different accounts
    role: "admin",
    name: "Management",
  });
  const [token] = useState<string | null>("prometheus_admin_2024");
  const [isLoading] = useState(false);

  // Permission state
  const [storedPermissions, setStoredPermissions] = useState<Record<string, AdminPermissions>>({});

  // Load permissions on mount
  useEffect(() => {
    setStoredPermissions(loadStoredPermissions());
  }, []);

  // Get current user's permissions
  const userEmail = user?.email || "";
  const userIsSuperAdmin = checkIsSuperAdmin(userEmail);

  // Super admin has all permissions, others get from storage
  const permissions: Permission[] = userIsSuperAdmin
    ? ["dashboard", "costs", "revenue", "analytics", "partners", "employees", "performance", "users", "sales", "influencers", "settings"]
    : (storedPermissions[userEmail]?.permissions || DEFAULT_PERMISSIONS);

  const sensitivePermissions: SensitivePermission[] = userIsSuperAdmin
    ? ["compensation:view", "compensation:edit"]
    : (storedPermissions[userEmail]?.sensitive_permissions || []);

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    if (user.role === "admin") return true;
    return roles.includes(user.role);
  };

  const hasPermission = (permission: Permission): boolean => {
    return checkHasPermission(permissions, permission, userIsSuperAdmin);
  };

  const hasSensitivePermission = (permission: SensitivePermission): boolean => {
    return checkHasSensitivePermission(sensitivePermissions, permission, userIsSuperAdmin);
  };

  // Get all admin permissions (for settings page)
  const getAllAdminPermissions = (): AdminPermissions[] => {
    return [
      // Super admin - always full access
      {
        email: ADMIN_EMAILS.SUPER_ADMIN,
        permissions: ["dashboard", "costs", "revenue", "analytics", "partners", "employees", "performance", "users", "sales", "influencers", "settings"],
        sensitive_permissions: ["compensation:view", "compensation:edit"],
        updated_at: "",
        updated_by: "",
      },
      // Other admins from storage
      storedPermissions[ADMIN_EMAILS.ADMIN] || {
        email: ADMIN_EMAILS.ADMIN,
        permissions: DEFAULT_PERMISSIONS,
        sensitive_permissions: [],
        updated_at: new Date().toISOString(),
        updated_by: ADMIN_EMAILS.SUPER_ADMIN,
      },
      storedPermissions[ADMIN_EMAILS.CAMPUS] || {
        email: ADMIN_EMAILS.CAMPUS,
        permissions: DEFAULT_PERMISSIONS,
        sensitive_permissions: [],
        updated_at: new Date().toISOString(),
        updated_by: ADMIN_EMAILS.SUPER_ADMIN,
      },
    ];
  };

  // Update admin permissions (super admin only)
  const updateAdminPermissions = (
    email: string,
    newPermissions: Permission[],
    newSensitivePermissions: SensitivePermission[]
  ): void => {
    if (!userIsSuperAdmin) {
      console.error("Only super admin can update permissions");
      return;
    }

    if (!isValidAdminEmail(email) || email === ADMIN_EMAILS.SUPER_ADMIN) {
      console.error("Cannot update permissions for this email");
      return;
    }

    const updated: AdminPermissions = {
      email: email as typeof ADMIN_EMAILS.ADMIN | typeof ADMIN_EMAILS.CAMPUS,
      permissions: newPermissions,
      sensitive_permissions: newSensitivePermissions,
      updated_at: new Date().toISOString(),
      updated_by: userEmail,
    };

    const newStoredPermissions = {
      ...storedPermissions,
      [email]: updated,
    };

    setStoredPermissions(newStoredPermissions);
    saveStoredPermissions(newStoredPermissions);
  };

  const login = async () => {
    // Auth disabled - do nothing
  };

  const logout = async () => {
    // Auth disabled - do nothing
  };

  const isAdmin = user?.role === "admin";
  const isSalesUser = user?.role === "sales" || user?.role === "partner" || isAdmin;
  const isInfluencerManager = user?.role === "influencer_manager";
  const isInfluencer = user?.role === "influencer";

  // CRM access based on permissions
  const canAccessCRM = hasPermission("dashboard") || hasPermission("costs") || hasPermission("revenue");

  // Influencers access
  const canAccessInfluencers = hasPermission("influencers") || isInfluencerManager;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isSuperAdmin: userIsSuperAdmin,
        isSalesUser,
        isInfluencerManager,
        isInfluencer,
        canAccessCRM,
        canAccessInfluencers,
        permissions,
        sensitivePermissions,
        hasPermission,
        hasSensitivePermission,
        getAllAdminPermissions,
        updateAdminPermissions,
        hasRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
