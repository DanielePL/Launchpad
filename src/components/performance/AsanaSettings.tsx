import { useState, useEffect } from "react";
import {
  X,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { asanaClient } from "@/api/asanaClient";
import type { AsanaWorkspace } from "@/api/types/asana";

interface AsanaSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigured: () => void;
}

type Step = "token" | "workspace" | "success";

export function AsanaSettings({ isOpen, onClose, onConfigured }: AsanaSettingsProps) {
  const [step, setStep] = useState<Step>("token");
  const [token, setToken] = useState("");
  const [workspaces, setWorkspaces] = useState<AsanaWorkspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing config
  useEffect(() => {
    const savedToken = localStorage.getItem("asana_token");
    const savedWorkspace = localStorage.getItem("asana_workspace");

    if (savedToken) {
      setToken(savedToken);
    }
    if (savedWorkspace) {
      setSelectedWorkspace(savedWorkspace);
    }
  }, [isOpen]);

  const validateToken = async () => {
    if (!token.trim()) {
      setError("Please enter token");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Configure client and test connection
      asanaClient.configure({ accessToken: token.trim() });

      // Get user to verify token works
      await asanaClient.getMe();

      // Get workspaces
      const ws = await asanaClient.getWorkspaces();
      setWorkspaces(ws);

      // Save token
      localStorage.setItem("asana_token", token.trim());

      if (ws.length === 1) {
        // Auto-select if only one workspace
        setSelectedWorkspace(ws[0].gid);
        localStorage.setItem("asana_workspace", ws[0].gid);
        localStorage.setItem("asana_workspace_name", ws[0].name);
        setStep("success");
      } else {
        setStep("workspace");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Token invalid or connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  const selectWorkspace = () => {
    if (!selectedWorkspace) {
      setError("Please select a workspace");
      return;
    }

    const ws = workspaces.find(w => w.gid === selectedWorkspace);
    localStorage.setItem("asana_workspace", selectedWorkspace);
    localStorage.setItem("asana_workspace_name", ws?.name || "");
    localStorage.setItem("asana_last_sync", new Date().toISOString());

    setStep("success");
  };

  const handleComplete = () => {
    onConfigured();
    onClose();
  };

  const handleDisconnect = () => {
    localStorage.removeItem("asana_token");
    localStorage.removeItem("asana_workspace");
    localStorage.removeItem("asana_workspace_name");
    localStorage.removeItem("asana_last_sync");
    setToken("");
    setSelectedWorkspace("");
    setWorkspaces([]);
    setStep("token");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F06A6A] to-[#FC636B] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                <circle cx="12" cy="12" r="3"/>
                <circle cx="12" cy="4" r="2"/>
                <circle cx="12" cy="20" r="2"/>
                <circle cx="4" cy="12" r="2"/>
                <circle cx="20" cy="12" r="2"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">Connect Asana</h2>
              <p className="text-xs text-muted-foreground">Sync task data</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Step: Token */}
        {step === "token" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">
                You need a Personal Access Token from Asana:
              </p>
              <a
                href="https://app.asana.com/0/my-apps"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Open Asana Developer Console
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Key className="w-4 h-4" />
                Personal Access Token
              </label>
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="1/1234567890:abcdef..."
                className="rounded-xl font-mono text-sm"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              onClick={validateToken}
              disabled={isLoading || !token.trim()}
              className="w-full rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        )}

        {/* Step: Workspace */}
        {step === "workspace" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Select workspace
              </label>
              <div className="space-y-2">
                {workspaces.map((ws) => (
                  <button
                    key={ws.gid}
                    onClick={() => setSelectedWorkspace(ws.gid)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedWorkspace === ws.gid
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <p className="font-medium">{ws.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setStep("token")}
                className="rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={selectWorkspace}
                disabled={!selectedWorkspace}
                className="flex-1 rounded-xl"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>

            <div>
              <h3 className="text-lg font-bold">Successfully connected!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Asana is now connected to the Performance Tracker.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 text-left">
              <p className="text-xs text-muted-foreground mb-1">Workspace</p>
              <p className="font-medium">
                {workspaces.find(w => w.gid === selectedWorkspace)?.name ||
                 localStorage.getItem("asana_workspace_name") ||
                 "Unknown"}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="rounded-xl"
              >
                Disconnect
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1 rounded-xl glow-orange"
              >
                Done
              </Button>
            </div>
          </div>
        )}

        {/* Help text */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            The token is stored locally and only used for API requests.
          </p>
        </div>
      </div>
    </div>
  );
}
