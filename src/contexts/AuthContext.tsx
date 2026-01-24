import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, UserRole } from "@/api/types/auth";
import {
  type Permission,
  type SensitivePermission,
  type AdminPermissions,
  type AdminAccount,
  ADMIN_EMAILS,
  ADMIN_ACCOUNTS,
  ROLE_PERMISSIONS,
  isValidAdminEmail,
  isSuperAdmin as checkIsSuperAdmin,
  hasPermission as checkHasPermission,
  hasSensitivePermission as checkHasSensitivePermission,
} from "@/api/types/permissions";

// Storage keys
const AUTH_STORAGE_KEY = "admin_auth";
const PERMISSIONS_STORAGE_KEY = "admin_permissions";

interface StoredAuth {
  email: string;
  name: string;
  role: AdminAccount["role"];
}

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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Load stored auth from localStorage
function loadStoredAuth(): StoredAuth | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load auth:", e);
  }
  return null;
}

// Save auth to localStorage
function saveStoredAuth(auth: StoredAuth): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

// Clear auth from localStorage
function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

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
  return {};
}

// Save permissions to localStorage
function saveStoredPermissions(permissions: Record<string, AdminPermissions>): void {
  localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storedPermissions, setStoredPermissions] = useState<Record<string, AdminPermissions>>({});

  // Load auth on mount
  useEffect(() => {
    const storedAuth = loadStoredAuth();
    if (storedAuth) {
      setUser({
        id: storedAuth.email,
        email: storedAuth.email,
        role: "admin",
        name: storedAuth.name,
      });
      setToken("prometheus_admin_token");
    }
    setStoredPermissions(loadStoredPermissions());
    setIsLoading(false);
  }, []);

  // Get current user's permissions
  const userEmail = user?.email || "";
  const userIsSuperAdmin = checkIsSuperAdmin(userEmail);

  // Find account for current user
  const currentAccount = ADMIN_ACCOUNTS.find(acc => acc.email === userEmail);
  const accountRole = currentAccount?.role || "admin";

  // Get permissions based on role
  const permissions: Permission[] = ROLE_PERMISSIONS[accountRole] || [];

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
    return ADMIN_ACCOUNTS.map(account => ({
      email: account.email,
      permissions: ROLE_PERMISSIONS[account.role],
      sensitive_permissions: account.role === "super_admin"
        ? ["compensation:view", "compensation:edit"] as SensitivePermission[]
        : [],
      updated_at: "",
      updated_by: "",
    }));
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
      email: email as typeof ADMIN_EMAILS.ADMIN,
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

  const login = async (email: string, password: string): Promise<boolean> => {
    // Find account by email
    const account = ADMIN_ACCOUNTS.find(acc => acc.email === email);

    if (!account) {
      return false;
    }

    // Verify password
    if (account.password !== password) {
      return false;
    }

    // Set user state
    setUser({
      id: account.email,
      email: account.email,
      role: "admin",
      name: account.name,
    });
    setToken("prometheus_admin_token");

    // Save to localStorage
    saveStoredAuth({
      email: account.email,
      name: account.name,
      role: account.role,
    });

    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearStoredAuth();
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
