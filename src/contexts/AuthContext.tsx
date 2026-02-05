import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/api/supabaseClient";
import {
  type Permission,
  type SensitivePermission,
  type OrganizationRole,
  type Organization,
  type OrganizationMember,
  type UserProfile,
  ROLE_PERMISSIONS,
  ROLE_SENSITIVE_PERMISSIONS,
  hasPermission as checkHasPermission,
  hasSensitivePermission as checkHasSensitivePermission,
} from "@/api/types/permissions";

// =============================================================================
// Types
// =============================================================================

interface AuthContextType {
  // Supabase Auth
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Organization Context
  organization: Organization | null;
  membership: OrganizationMember | null;
  userProfile: UserProfile | null;
  organizations: Organization[]; // All orgs user belongs to

  // Role & Permission Checks
  isOwner: boolean;
  isAdmin: boolean;
  role: OrganizationRole | null;
  permissions: Permission[];
  sensitivePermissions: SensitivePermission[];
  hasPermission: (permission: Permission) => boolean;
  hasSensitivePermission: (permission: SensitivePermission) => boolean;
  hasRole: (role: OrganizationRole | OrganizationRole[]) => boolean;

  // Auth Actions
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;

  // Organization Actions
  switchOrganization: (orgId: string) => Promise<void>;
  createOrganization: (
    name: string,
    slug: string
  ) => Promise<{ organization: Organization | null; error: Error | null }>;
  acceptInvitation: (
    token: string
  ) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// Provider Component
// =============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Organization State
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<OrganizationMember | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  // ---------------------------------------------------------------------------
  // Fetch User Data (Profile, Memberships, Organizations)
  // ---------------------------------------------------------------------------

  const fetchUserData = useCallback(async (userId: string) => {
    if (!supabase) return;

    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        // Profile might not exist yet for new users, that's ok
        console.log("Profile not found, user may need to complete onboarding");
      }

      if (profile) {
        setUserProfile(profile);
      }

      // Fetch all organization memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from("organization_members")
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq("user_id", userId);

      if (membershipsError) {
        // User might not be in any org yet, that's ok
        console.log("No memberships found, user may need to create organization");
        return;
      }

      if (memberships && memberships.length > 0) {
        // Extract organizations
        const orgs = memberships
          .map((m) => m.organization as Organization)
          .filter(Boolean);
        setOrganizations(orgs);

        // Determine current organization
        let currentOrgId = profile?.current_organization_id;

        // If no current org set, use first one
        if (!currentOrgId && orgs.length > 0) {
          currentOrgId = orgs[0].id;
        }

        // Find the membership for current org
        const currentMembership = memberships.find(
          (m) => m.organization_id === currentOrgId
        );

        if (currentMembership) {
          setMembership(currentMembership);
          setOrganization(currentMembership.organization as Organization);

          // Update profile if current_organization_id was not set
          if (!profile?.current_organization_id && supabase) {
            await supabase
              .from("user_profiles")
              .update({ current_organization_id: currentOrgId })
              .eq("id", userId);
          }
        }
      }
    } catch (error) {
      // Ignore abort errors (component unmounted)
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error("Error fetching user data:", error);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Initialize Auth & Listen for Changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!supabase) {
      console.log("Supabase not configured");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase!.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserData(session.user.id);
        }
      } catch (error: unknown) {
        // Ignore AbortError - happens in React StrictMode due to double-mounting
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Failed to initialize session:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      try {
        if (event === "SIGNED_IN" && session?.user) {
          await fetchUserData(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setOrganization(null);
          setMembership(null);
          setUserProfile(null);
          setOrganizations([]);
        }
      } catch (error: unknown) {
        // Ignore AbortError - happens in React StrictMode
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Auth state change error:", error);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------

  const role = membership?.role ?? null;
  const isOwner = role === "owner";
  const isAdmin = role === "owner" || role === "admin";

  // Get permissions based on role
  const permissions: Permission[] = role ? ROLE_PERMISSIONS[role] : [];
  const sensitivePermissions: SensitivePermission[] = role
    ? ROLE_SENSITIVE_PERMISSIONS[role]
    : [];

  // ---------------------------------------------------------------------------
  // Permission Helpers
  // ---------------------------------------------------------------------------

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return checkHasPermission(permissions, permission, isOwner);
    },
    [permissions, isOwner]
  );

  const hasSensitivePermission = useCallback(
    (permission: SensitivePermission): boolean => {
      return checkHasSensitivePermission(sensitivePermissions, permission, isOwner);
    },
    [sensitivePermissions, isOwner]
  );

  const hasRole = useCallback(
    (checkRole: OrganizationRole | OrganizationRole[]): boolean => {
      if (!role) return false;
      const roles = Array.isArray(checkRole) ? checkRole : [checkRole];
      return roles.includes(role);
    },
    [role]
  );

  // ---------------------------------------------------------------------------
  // Auth Actions
  // ---------------------------------------------------------------------------

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: Error | null }> => {
      if (!supabase) {
        return { error: new Error("Supabase not configured") };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error: error ? new Error(error.message) : null };
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName?: string
    ): Promise<{ error: Error | null }> => {
      if (!supabase) {
        return { error: new Error("Supabase not configured") };
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      return { error: error ? new Error(error.message) : null };
    },
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<{ error: Error | null }> => {
      if (!supabase) {
        return { error: new Error("Supabase not configured") };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      return { error: error ? new Error(error.message) : null };
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Organization Actions
  // ---------------------------------------------------------------------------

  const switchOrganization = useCallback(
    async (orgId: string): Promise<void> => {
      if (!supabase || !user) return;

      // Find the membership for this org
      const newMembership = organizations.find((o) => o.id === orgId);
      if (!newMembership) return;

      // Update profile with new current org
      await supabase
        .from("user_profiles")
        .update({ current_organization_id: orgId })
        .eq("id", user.id);

      // Refetch to update state
      await fetchUserData(user.id);
    },
    [user, organizations, fetchUserData]
  );

  const createOrganization = useCallback(
    async (
      name: string,
      slug: string
    ): Promise<{ organization: Organization | null; error: Error | null }> => {
      if (!supabase || !user) {
        return { organization: null, error: new Error("Not authenticated") };
      }

      try {
        console.log("[CreateOrg] Starting for user:", user.id);

        // Create organization
        const { data: org, error: orgError } = await supabase
          .from("organizations")
          .insert({ name, slug })
          .select()
          .single();

        console.log("[CreateOrg] Org insert result:", { org, orgError });

        if (orgError) {
          return { organization: null, error: new Error(orgError.message) };
        }

        // Add user as owner
        const { error: memberError } = await supabase
          .from("organization_members")
          .insert({
            organization_id: org.id,
            user_id: user.id,
            role: "owner",
          });

        console.log("[CreateOrg] Member insert result:", { memberError });

        if (memberError) {
          // Rollback org creation
          await supabase.from("organizations").delete().eq("id", org.id);
          return { organization: null, error: new Error(memberError.message) };
        }

        // Update or create user's profile with current org
        const { error: profileError } = await supabase
          .from("user_profiles")
          .upsert({
            id: user.id,
            current_organization_id: org.id,
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          });

        console.log("[CreateOrg] Profile upsert result:", { profileError });

        // Refetch user data
        await fetchUserData(user.id);

        return { organization: org, error: null };
      } catch (err) {
        return {
          organization: null,
          error: err instanceof Error ? err : new Error("Unknown error"),
        };
      }
    },
    [user, fetchUserData]
  );

  const acceptInvitation = useCallback(
    async (token: string): Promise<{ error: Error | null }> => {
      if (!supabase || !user) {
        return { error: new Error("Not authenticated") };
      }

      try {
        // Find invitation by token
        const { data: invitation, error: inviteError } = await supabase
          .from("organization_invitations")
          .select("*")
          .eq("token", token)
          .single();

        if (inviteError || !invitation) {
          return { error: new Error("Invalid or expired invitation") };
        }

        // Check if invitation has expired
        if (new Date(invitation.expires_at) < new Date()) {
          return { error: new Error("Invitation has expired") };
        }

        // Check if user email matches invitation
        if (invitation.email !== user.email) {
          return { error: new Error("Invitation is for a different email address") };
        }

        // Add user to organization
        const { error: memberError } = await supabase
          .from("organization_members")
          .insert({
            organization_id: invitation.organization_id,
            user_id: user.id,
            role: invitation.role,
          });

        if (memberError) {
          // Might already be a member
          if (memberError.code === "23505") {
            return { error: new Error("You are already a member of this organization") };
          }
          return { error: new Error(memberError.message) };
        }

        // Delete the invitation
        await supabase
          .from("organization_invitations")
          .delete()
          .eq("id", invitation.id);

        // Refetch user data
        await fetchUserData(user.id);

        return { error: null };
      } catch (err) {
        return {
          error: err instanceof Error ? err : new Error("Unknown error"),
        };
      }
    },
    [user, fetchUserData]
  );

  // ---------------------------------------------------------------------------
  // Context Value
  // ---------------------------------------------------------------------------

  const value: AuthContextType = {
    // Auth State
    user,
    session,
    isLoading,
    isAuthenticated: !!session && !!user,

    // Organization State
    organization,
    membership,
    userProfile,
    organizations,

    // Role & Permissions
    isOwner,
    isAdmin,
    role,
    permissions,
    sensitivePermissions,
    hasPermission,
    hasSensitivePermission,
    hasRole,

    // Auth Actions
    signIn,
    signUp,
    signOut,
    resetPassword,

    // Organization Actions
    switchOrganization,
    createOrganization,
    acceptInvitation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================================================
// Hook
// =============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
