import { Link } from "react-router-dom";
import { Bot, Rocket, Clock, ArrowLeft, Plus, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { AssistantView } from "@/components/app-launch/assistant";
import {
  useActiveSession,
  usePausedSessions,
  useCreateSession,
  useResumeSession,
} from "@/hooks/useAssistantSession";
import type { AssistantSession } from "@/api/types/appLaunch";
import { ASSISTANT_PHASES } from "@/api/types/appLaunch";

function LoadingScreen() {
  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Lade Assistant...</p>
      </div>
    </div>
  );
}

function WelcomeScreen({ onStart, isLoading }: { onStart: () => void; isLoading: boolean }) {
  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-8">
      <div className="max-w-xl text-center">
        {/* Header */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mx-auto mb-6">
          <Bot className="h-10 w-10 text-white" />
        </div>

        <h1 className="text-3xl font-bold mb-4">
          Willkommen zum Launch Assistant
        </h1>

        <p className="text-lg text-muted-foreground mb-8">
          Ich führe dich Schritt für Schritt durch den gesamten App-Launch-Prozess.
          Du siehst immer nur <span className="text-foreground font-medium">eine Frage</span> -
          keine Sorge, ich kümmere mich um alles andere.
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-left">
          <div className="p-4 rounded-lg bg-background/50 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Rocket className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-medium text-sm mb-1">Zero Overwhelm</h3>
            <p className="text-xs text-muted-foreground">
              Eine Frage zur Zeit
            </p>
          </div>

          <div className="p-4 rounded-lg bg-background/50 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-medium text-sm mb-1">AI Power</h3>
            <p className="text-xs text-muted-foreground">
              Ich fülle alles für dich aus
            </p>
          </div>

          <div className="p-4 rounded-lg bg-background/50 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-medium text-sm mb-1">Pausierbar</h3>
            <p className="text-xs text-muted-foreground">
              Jederzeit fortsetzen
            </p>
          </div>
        </div>

        {/* CTA */}
        <Button
          size="lg"
          className="gap-2 px-8"
          onClick={onStart}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="h-4 w-4" />
          )}
          Los geht's!
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          Dauert nur wenige Minuten
        </p>

        <div className="mt-8">
          <Link
            to="/app-launch"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3 inline mr-1" />
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ResumeSessionDialog({
  sessions,
  onResume,
  onStartNew,
  isResuming,
  isCreating,
}: {
  sessions: AssistantSession[];
  onResume: (id: string) => void;
  onStartNew: () => void;
  isResuming: boolean;
  isCreating: boolean;
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPhaseLabel = (phase: string) => {
    return ASSISTANT_PHASES.find((p) => p.id === phase)?.label || phase;
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Willkommen zurück!</h1>
          <p className="text-muted-foreground">
            Du hast pausierte Sessions. Möchtest du fortfahren?
          </p>
        </div>

        {/* Paused Sessions */}
        <div className="space-y-3 mb-6">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onResume(session.id)}
              disabled={isResuming}
              className="w-full p-4 rounded-lg bg-background/50 border border-white/10 hover:border-primary/50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {session.collected_data.app_name || "Unbenannte App"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Phase: {getPhaseLabel(session.current_phase)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pausiert am {formatDate(session.paused_at || session.updated_at)}
                  </p>
                </div>
                <Play className="h-5 w-5 text-primary" />
              </div>
            </button>
          ))}
        </div>

        {/* Start New */}
        <div className="border-t border-white/10 pt-6">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={onStartNew}
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Neue Session starten
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/app-launch"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3 inline mr-1" />
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export function LaunchAssistantPage() {
  const { data: activeSession, isLoading: isLoadingActive } = useActiveSession();
  const { data: pausedSessions, isLoading: isLoadingPaused } = usePausedSessions();
  const createSession = useCreateSession();
  const resumeSession = useResumeSession();

  const isLoading = isLoadingActive || isLoadingPaused;

  const handleStartNew = async () => {
    try {
      await createSession.mutateAsync();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Fehler beim Erstellen der Session"
      );
    }
  };

  const handleResume = async (sessionId: string) => {
    try {
      await resumeSession.mutateAsync(sessionId);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Fehler beim Fortsetzen"
      );
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show resume dialog if there are paused sessions and no active session
  if (pausedSessions && pausedSessions.length > 0 && !activeSession) {
    return (
      <ResumeSessionDialog
        sessions={pausedSessions}
        onResume={handleResume}
        onStartNew={handleStartNew}
        isResuming={resumeSession.isPending}
        isCreating={createSession.isPending}
      />
    );
  }

  // No session - show welcome screen
  if (!activeSession) {
    return (
      <WelcomeScreen
        onStart={handleStartNew}
        isLoading={createSession.isPending}
      />
    );
  }

  // Active session - show assistant view
  return <AssistantView session={activeSession} />;
}
