import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppProjects, useAppLaunchStats } from "@/hooks/useAppLaunch";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  Plus,
  Smartphone,
  Apple,
  Play,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NewProjectDialog } from "@/components/app-launch/NewProjectDialog";
import { WelcomeAssistantModal } from "@/components/app-launch/assistant";
import type { ProjectStatus } from "@/api/types/appLaunch";

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: React.ReactNode }> = {
  setup: { label: "Setup", color: "bg-gray-500", icon: <Clock className="h-3 w-3" /> },
  preparing: { label: "Preparing", color: "bg-blue-500", icon: <Clock className="h-3 w-3" /> },
  beta: { label: "Beta", color: "bg-purple-500", icon: <Users className="h-3 w-3" /> },
  review: { label: "In Review", color: "bg-yellow-500", icon: <Clock className="h-3 w-3" /> },
  approved: { label: "Approved", color: "bg-green-500", icon: <CheckCircle2 className="h-3 w-3" /> },
  live: { label: "Live", color: "bg-green-600", icon: <Rocket className="h-3 w-3" /> },
  updating: { label: "Updating", color: "bg-orange-500", icon: <Clock className="h-3 w-3" /> },
};

export function AppLaunchDashboard() {
  const { data: projects, isLoading } = useAppProjects();
  const { data: stats } = useAppLaunchStats();
  const [showNewProject, setShowNewProject] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Show welcome modal unless user has permanently dismissed it
  useEffect(() => {
    if (isLoading) return;

    const permanentlyDismissed = localStorage.getItem("launchpad_assistant_dismissed") === "true";

    if (!permanentlyDismissed) {
      setShowWelcomeModal(true);
    }
  }, [isLoading]);

  const handleWelcomeModalClose = (dontShowAgain: boolean) => {
    setShowWelcomeModal(false);
    if (dontShowAgain) {
      localStorage.setItem("launchpad_assistant_dismissed", "true");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            App Launch
          </h1>
          <p className="text-muted-foreground mt-1">
            Launch your apps to Google Play & App Store with AI assistance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowWelcomeModal(true)}>
            <Bot className="h-4 w-4" />
            AI Wizard
          </Button>
          <Button onClick={() => setShowNewProject(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Smartphone className="h-4 w-4" />
            <span className="text-sm">Total Projects</span>
          </div>
          <p className="text-2xl font-bold">{stats?.total_projects || 0}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Rocket className="h-4 w-4" />
            <span className="text-sm">Live Apps</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{stats?.live_apps || 0}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Pending Reviews</span>
          </div>
          <p className="text-2xl font-bold text-yellow-500">{stats?.pending_reviews || 0}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-sm">Beta Testers</span>
          </div>
          <p className="text-2xl font-bold text-purple-500">{stats?.active_beta_testers || 0}</p>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="glass rounded-xl p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Launch AI Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Starte den geführten Launch-Prozess mit AI-Unterstützung
              </p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => setShowWelcomeModal(true)}>
            <Bot className="h-4 w-4" />
            Wizard starten
          </Button>
        </div>
      </div>

      {/* Projects List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your App Projects</h2>

        {isLoading ? (
          <div className="glass rounded-xl p-8 text-center text-muted-foreground">
            Loading projects...
          </div>
        ) : !projects?.length ? (
          <div className="glass rounded-xl p-12 text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 text-primary opacity-80" />
            <h3 className="font-semibold mb-2">Noch keine Projekte</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Starte den AI-Assistenten und lass dich Schritt für Schritt zum App-Launch führen
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setShowWelcomeModal(true)} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Mit AI-Assistent starten
              </Button>
              <Button variant="outline" onClick={() => setShowNewProject(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Manuell erstellen
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const statusConfig = STATUS_CONFIG[project.status];

              return (
                <Link
                  key={project.id}
                  to={`/app-launch/project/${project.id}`}
                  className="glass rounded-xl p-5 hover:bg-background/80 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {project.icon_url ? (
                        <img
                          src={project.icon_url}
                          alt={project.name}
                          className="w-12 h-12 rounded-xl"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Smartphone className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {project.platforms.includes("android") && (
                            <Play className="h-3 w-3 text-green-500" />
                          )}
                          {project.platforms.includes("ios") && (
                            <Apple className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full flex items-center gap-1 text-white",
                        statusConfig.color
                      )}
                    >
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{project.completion_percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${project.completion_percentage}%` }}
                      />
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <span className="text-xs text-muted-foreground">
                      {project.target_launch_date
                        ? `Target: ${new Date(project.target_launch_date).toLocaleDateString()}`
                        : "No target date"}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* New Project Dialog */}
      <NewProjectDialog
        open={showNewProject}
        onOpenChange={setShowNewProject}
      />

      {/* Welcome Assistant Modal */}
      <WelcomeAssistantModal
        open={showWelcomeModal}
        onClose={handleWelcomeModalClose}
      />
    </div>
  );
}
