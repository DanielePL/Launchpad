import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authApi } from "@/api/endpoints/auth";
import type { User } from "@/api/types/auth";

// Whitelist of allowed admin users
const ALLOWED_ADMINS = [
  { email: "danielepauli@gmail.com", userId: "faba7636-66b9-43cd-8570-37cdc32ffff0" },
  { email: "ks.k.kaenel@gmail.com", userId: "b63ad00f-95c7-4ca3-9f6f-1b281f5c78a7" },
];

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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedToken = localStorage.getItem("admin_token");
    const storedUser = localStorage.getItem("admin_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid stored user, clear storage
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, userId: string) => {
    // Check if user is in whitelist
    const isAllowed = ALLOWED_ADMINS.some(
      (admin) => admin.email.toLowerCase() === email.toLowerCase() && admin.userId === userId
    );

    if (!isAllowed) {
      throw new Error("Access denied. You are not authorized to access this admin panel.");
    }

    const response = await authApi.login({ email, user_id: userId });

    if (response.success) {
      const newUser: User = { id: userId, email: response.email };
      setToken(response.session_token);
      setUser(newUser);
      localStorage.setItem("admin_token", response.session_token);
      localStorage.setItem("admin_user", JSON.stringify(newUser));
    } else {
      throw new Error("Login failed");
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await authApi.logout(token);
      } catch {
        // Ignore logout errors
      }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
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
