import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "@/api/types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Auth disabled - always authenticated with admin password
  const [user] = useState<User | null>({ id: "admin", email: "admin@prometheus.app" });
  const [token] = useState<string | null>("prometheus_admin_2024");
  const [isLoading] = useState(false);

  const login = async () => {
    // Auth disabled - do nothing
  };

  const logout = async () => {
    // Auth disabled - do nothing
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
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
