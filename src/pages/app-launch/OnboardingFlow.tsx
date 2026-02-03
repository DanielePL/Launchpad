import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useCreateAppProject } from "@/hooks/useAppLaunch";
import {
  WelcomeScreen,
  DiscoveryChat,
  ChecklistPreview,
} from "@/components/app-launch/onboarding";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import gradientBg from "@/assets/gradient-bg.jpg";
import gradientBgDark from "@/assets/gradient-bg-dark.png";
import type { OnboardingAnswers } from "@/api/types/appLaunch";

type OnboardingStep = "welcome" | "discovery" | "preview";

export function OnboardingFlow() {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [answers, setAnswers] = useState<OnboardingAnswers | null>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const createProject = useCreateAppProject();

  const handleDiscoveryComplete = (discoveryAnswers: OnboardingAnswers) => {
    setAnswers(discoveryAnswers);
    setStep("preview");
  };

  const handleConfirm = async () => {
    if (!answers) return;

    try {
      const project = await createProject.mutateAsync({
        name: answers.app_name,
        description: `${answers.app_type} app built with ${answers.tech_stack}`,
        platforms: answers.platforms,
        app_category: answers.app_type,
      });

      if (project) {
        toast.success("Projekt erstellt!");
        navigate(`/app-launch/project/${project.id}`);
      }
    } catch (error) {
      toast.error("Fehler beim Erstellen des Projekts");
    }
  };

  const handleBack = () => {
    if (step === "preview") {
      setStep("discovery");
    } else if (step === "discovery") {
      setStep("welcome");
    } else {
      navigate("/app-launch");
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: `url(${theme === "dark" ? gradientBgDark : gradientBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 p-4">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {step === "welcome" ? "Zurück zu Projekten" : "Zurück"}
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-2">
          {["welcome", "discovery", "preview"].map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                step === s
                  ? "w-8 bg-primary"
                  : i < ["welcome", "discovery", "preview"].indexOf(step)
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-screen flex items-center justify-center p-6 pt-20">
        <div className="w-full max-w-4xl">
          {step === "welcome" && (
            <div className="glass rounded-2xl p-8">
              <WelcomeScreen onStart={() => setStep("discovery")} />
            </div>
          )}

          {step === "discovery" && (
            <div className="glass rounded-2xl p-6">
              <DiscoveryChat onComplete={handleDiscoveryComplete} />
            </div>
          )}

          {step === "preview" && answers && (
            <div className="glass rounded-2xl p-8">
              <ChecklistPreview
                answers={answers}
                onConfirm={handleConfirm}
                onBack={() => setStep("discovery")}
                isCreating={createProject.isPending}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
