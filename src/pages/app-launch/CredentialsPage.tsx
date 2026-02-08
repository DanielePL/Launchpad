import { useParams, Link } from "react-router-dom";
import { useAppProject } from "@/hooks/useAppLaunch";
import { Button } from "@/components/ui/button";
import { CredentialWizard } from "@/components/app-launch/credentials";
import { ArrowLeft, Key, Play, Apple } from "lucide-react";
import type { Platform } from "@/api/types/appLaunch";

export function CredentialsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useAppProject(id || "");

  if (isLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-4">Project not found</p>
        <Link to="/app-launch">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const platforms = project.platforms as Platform[];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/app-launch/project/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4 flex-1">
          {project.icon_url ? (
            <img
              src={project.icon_url}
              alt={project.name}
              className="w-12 h-12 rounded-xl"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Key className="h-6 w-6 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">API Keys</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-muted-foreground">{project.name}</span>
              <span className="text-muted-foreground">·</span>
              <div className="flex items-center gap-1">
                {platforms.includes("android") && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Play className="h-3 w-3 text-green-500" /> Android
                  </span>
                )}
                {platforms.includes("ios") && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
                    <Apple className="h-3 w-3" /> iOS
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wizard */}
      <CredentialWizard projectId={id!} platforms={platforms} />
    </div>
  );
}
