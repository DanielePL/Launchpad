import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Flame, ArrowLeft, Crown, User, GraduationCap, Handshake, Eye, EyeOff } from "lucide-react";
import { useTheme } from "next-themes";
import { ADMIN_ACCOUNTS, type AdminAccount } from "@/api/types/permissions";
import gradientBg from "@/assets/gradient-bg.jpg";
import gradientBgDark from "@/assets/gradient-bg-dark.png";

// Role icons and colors
const roleConfig: Record<AdminAccount["role"], { icon: typeof User; color: string; label: string }> = {
  super_admin: { icon: Crown, color: "text-yellow-500 bg-yellow-500/20", label: "Super Admin" },
  admin: { icon: User, color: "text-blue-500 bg-blue-500/20", label: "Admin" },
  campus: { icon: GraduationCap, color: "text-green-500 bg-green-500/20", label: "Campus" },
  partner_manager: { icon: Handshake, color: "text-purple-500 bg-purple-500/20", label: "Partner Manager" },
};

export function LoginPage() {
  const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  // Determine redirect path based on role
  const getRedirectPath = (account: AdminAccount): string => {
    // If there's a specific "from" location, use it unless it's the root
    const fromPath = location.state?.from?.pathname;
    if (fromPath && fromPath !== "/") {
      return fromPath;
    }

    // Partner managers should go to partners page by default
    if (account.role === "partner_manager") {
      return "/partners";
    }

    // Everyone else goes to dashboard
    return "/";
  };

  const handleAccountSelect = (account: AdminAccount) => {
    setSelectedAccount(account);
    setPassword("");
    setError("");
  };

  const handleBack = () => {
    setSelectedAccount(null);
    setPassword("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    setError("");
    setIsLoading(true);

    try {
      const success = await login(selectedAccount.email, password);
      if (success) {
        navigate(getRedirectPath(selectedAccount), { replace: true });
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${theme === "dark" ? gradientBgDark : gradientBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-md glass rounded-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary glow-orange">
            <Flame className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Prometheus Admin
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedAccount ? `Welcome back, ${selectedAccount.name}` : "Select your account to sign in"}
          </p>
        </div>

        {!selectedAccount ? (
          // Account Selection View
          <div className="space-y-3">
            {ADMIN_ACCOUNTS.map((account) => {
              const config = roleConfig[account.role];
              const Icon = config.icon;

              return (
                <button
                  key={account.email}
                  onClick={() => handleAccountSelect(account)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-background/50 hover:bg-background/80 border border-white/10 hover:border-primary/30 transition-all duration-200 group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-foreground">{account.name}</p>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowLeft className="w-5 h-5 text-primary rotate-180" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          // Password Entry View
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Back button */}
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Choose different account
            </button>

            {/* Selected account card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-primary/30">
              {(() => {
                const config = roleConfig[selectedAccount.role];
                const Icon = config.icon;
                return (
                  <>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-foreground">{selectedAccount.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedAccount.email}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl pr-12"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold rounded-xl glow-orange transition-smooth"
              disabled={isLoading || !password}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          AI-Powered Fitness & Nutrition Coaching
        </p>
      </div>
    </div>
  );
}
