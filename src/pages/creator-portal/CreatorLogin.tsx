import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Mail, Key, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePartnerLogin } from "@/hooks/usePartnerPortal";

export default function CreatorLogin() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const login = usePartnerLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !code) {
      setError("Please enter both email and referral code");
      return;
    }

    login.mutate(
      { email, code },
      {
        onSuccess: () => {
          navigate("/creator");
        },
        onError: () => {
          setError("Invalid email or referral code. Please try again.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl glass p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary glow-orange mb-4">
              <Flame className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Creator Portal</h1>
            <p className="text-muted-foreground text-center mt-2">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 mb-6 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="creator@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Referral Code</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Your referral code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="pl-10 uppercase"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={login.isPending}
            >
              {login.isPending ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have access?{" "}
            <a href="mailto:creators@prometheus.app" className="text-primary hover:underline">
              Contact us
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Prometheus Creator Program
        </p>
      </div>
    </div>
  );
}
