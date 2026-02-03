import { Check, Pause, Sparkles, Code, Cpu, Store, FileText, Image, Shield, Users, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AssistantSession, AssistantPhase } from "@/api/types/appLaunch";
import { ASSISTANT_PHASES } from "@/api/types/appLaunch";

interface ProtocolSidebarProps {
  session: AssistantSession;
  onPause: () => void;
  isPausing?: boolean;
}

const PHASE_ICONS: Record<AssistantPhase, React.ReactNode> = {
  discovery: <Sparkles className="h-4 w-4" />,
  code_source: <Code className="h-4 w-4" />,
  tech_analysis: <Cpu className="h-4 w-4" />,
  store_presence: <Store className="h-4 w-4" />,
  store_listings: <FileText className="h-4 w-4" />,
  assets: <Image className="h-4 w-4" />,
  compliance: <Shield className="h-4 w-4" />,
  beta: <Users className="h-4 w-4" />,
  release: <Rocket className="h-4 w-4" />,
};

function getPhaseValue(session: AssistantSession, phaseId: AssistantPhase): string | null {
  const data = session.collected_data;
  switch (phaseId) {
    case "discovery":
      return data.app_name || null;
    case "code_source":
      return data.code_source?.type || null;
    case "tech_analysis":
      return data.tech_stack || null;
    case "store_presence":
      if (data.store_accounts?.google && data.store_accounts?.apple) return "Beide";
      if (data.store_accounts?.google) return "Google";
      if (data.store_accounts?.apple) return "Apple";
      return null;
    default:
      return null;
  }
}

export function ProtocolSidebar({ session, onPause, isPausing }: ProtocolSidebarProps) {
  const completedCount = session.phases_completed.length;
  const totalPhases = ASSISTANT_PHASES.length;
  const progressPercent = Math.round((completedCount / totalPhases) * 100);

  return (
    <div className="w-80 border-r border-white/10 bg-background/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="font-semibold text-lg">Launch Protokoll</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {session.collected_data.app_name || "Neue App"}
        </p>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Fortschritt</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Phase List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {ASSISTANT_PHASES.map((phase) => {
          const isCompleted = session.phases_completed.includes(phase.id);
          const isCurrent = session.current_phase === phase.id;
          const value = getPhaseValue(session, phase.id);

          return (
            <div
              key={phase.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                isCurrent && "bg-primary/10 border border-primary/20",
                isCompleted && !isCurrent && "text-muted-foreground"
              )}
            >
              {/* Status Icon */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                isCompleted && "bg-green-500/20 text-green-500",
                isCurrent && !isCompleted && "border-2 border-primary animate-pulse",
                !isCompleted && !isCurrent && "border border-white/20"
              )}>
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                ) : null}
              </div>

              {/* Phase Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-primary"
                  )}>
                    {phase.label}
                  </span>
                  {PHASE_ICONS[phase.id]}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {phase.description}
                </p>
              </div>

              {/* Collected Value */}
              {isCompleted && value && (
                <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                  {value}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={onPause}
          disabled={isPausing}
        >
          <Pause className="h-4 w-4" />
          {isPausing ? "Wird pausiert..." : "Session pausieren"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Du kannst später fortfahren
        </p>
      </div>
    </div>
  );
}
