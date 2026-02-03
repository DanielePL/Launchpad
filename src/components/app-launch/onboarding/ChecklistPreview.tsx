import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  Check,
  Settings,
  FileText,
  Image,
  Shield,
  Users,
  Sparkles,
  Clock,
  ArrowRight,
  Play,
  Apple,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingAnswers, ChecklistCategory } from "@/api/types/appLaunch";

interface ChecklistPreviewProps {
  answers: OnboardingAnswers;
  onConfirm: () => void;
  onBack: () => void;
  isCreating?: boolean;
}

const CATEGORY_INFO: Record<
  ChecklistCategory,
  { icon: React.ReactNode; label: string; color: string }
> = {
  setup: {
    icon: <Settings className="h-4 w-4" />,
    label: "Setup",
    color: "text-blue-500",
  },
  store_listing: {
    icon: <FileText className="h-4 w-4" />,
    label: "Store Listing",
    color: "text-purple-500",
  },
  assets: {
    icon: <Image className="h-4 w-4" />,
    label: "Assets",
    color: "text-green-500",
  },
  compliance: {
    icon: <Shield className="h-4 w-4" />,
    label: "Compliance",
    color: "text-amber-500",
  },
  beta: {
    icon: <Users className="h-4 w-4" />,
    label: "Beta Testing",
    color: "text-cyan-500",
  },
  release: {
    icon: <Rocket className="h-4 w-4" />,
    label: "Release",
    color: "text-red-500",
  },
};

function generateChecklistSummary(answers: OnboardingAnswers) {
  const categories: { category: ChecklistCategory; items: string[] }[] = [];

  // Setup
  const setupItems: string[] = ["App-Infos vervollständigen"];
  if (answers.platforms.includes("android")) {
    if (answers.has_play_console === false || answers.has_play_console === null) {
      setupItems.push("Google Play Console Account erstellen");
    }
    setupItems.push("Google Play API Credentials");
  }
  if (answers.platforms.includes("ios")) {
    if (answers.has_apple_dev === false || answers.has_apple_dev === null) {
      setupItems.push("Apple Developer Account erstellen");
    }
    setupItems.push("App Store Connect API Key");
  }
  categories.push({ category: "setup", items: setupItems });

  // Store Listing
  const listingItems = [
    "App-Titel wählen",
    "Kurzbeschreibung schreiben",
    "Vollständige Beschreibung",
    "Kategorie auswählen",
    "Altersfreigabe festlegen",
  ];
  if (answers.platforms.includes("ios")) {
    listingItems.push("Keywords für App Store");
  }
  categories.push({ category: "store_listing", items: listingItems });

  // Assets
  const assetItems = ["App Icon erstellen"];
  if (answers.platforms.includes("android")) {
    assetItems.push("Android Screenshots");
    assetItems.push("Feature Graphic (1024x500)");
  }
  if (answers.platforms.includes("ios")) {
    assetItems.push("iOS Screenshots (alle Größen)");
  }
  assetItems.push("App Preview Video (optional)");
  categories.push({ category: "assets", items: assetItems });

  // Compliance
  const complianceItems = ["Privacy Policy erstellen"];
  if (answers.platforms.includes("android")) {
    complianceItems.push("Data Safety Form ausfüllen");
  }
  if (answers.platforms.includes("ios")) {
    complianceItems.push("App Privacy Labels");
  }
  complianceItems.push("Terms of Service (optional)");
  categories.push({ category: "compliance", items: complianceItems });

  // Beta
  categories.push({
    category: "beta",
    items: ["Internal Testing einrichten", "Beta Tester einladen", "Feedback sammeln"],
  });

  // Release
  categories.push({
    category: "release",
    items: [
      "Finalen Build erstellen",
      "Release Notes schreiben",
      "Zur Review einreichen",
      "Launch!",
    ],
  });

  return categories;
}

function estimateDays(answers: OnboardingAnswers): number {
  let days = 7; // Base

  // More platforms = more time
  if (answers.platforms.length === 2) days += 3;

  // Need to create accounts
  if (answers.has_play_console === false || answers.has_play_console === null) days += 2;
  if (answers.has_apple_dev === false || answers.has_apple_dev === null) days += 3;

  // Beginner needs more time
  if (answers.experience_level === "beginner") days += 5;
  else if (answers.experience_level === "intermediate") days += 2;

  // Not ready yet
  if (answers.development_status === "idea") days += 14;
  else if (answers.development_status === "development") days += 7;

  return days;
}

function getTipsForLevel(answers: OnboardingAnswers): string[] {
  const tips: string[] = [];

  if (answers.experience_level === "beginner") {
    tips.push("Nimm dir Zeit für jeden Schritt - Qualität vor Geschwindigkeit");
    tips.push("Der AI-Assistent kann dir Texte generieren und Fragen beantworten");
    tips.push("Screenshots sind wichtiger als du denkst - sie entscheiden über Downloads");
  } else if (answers.experience_level === "intermediate") {
    tips.push("Nutze das Asset Studio für alle Store-Grafiken");
    tips.push("Die automatische Checklist passt sich deinem Fortschritt an");
  } else {
    tips.push("Du kannst direkt zum Asset Studio springen");
    tips.push("API-Integration für automatische Uploads kommt bald");
  }

  return tips;
}

export function ChecklistPreview({
  answers,
  onConfirm,
  onBack,
  isCreating = false,
}: ChecklistPreviewProps) {
  const [expandedCategory, setExpandedCategory] = useState<ChecklistCategory | null>(
    "setup"
  );

  const checklistSummary = generateChecklistSummary(answers);
  const estimatedDays = estimateDays(answers);
  const tips = getTipsForLevel(answers);
  const totalItems = checklistSummary.reduce((sum, c) => sum + c.items.length, 0);

  const getLevelLabel = () => {
    switch (answers.experience_level) {
      case "beginner":
        return "Einsteiger";
      case "intermediate":
        return "Fortgeschritten";
      case "pro":
        return "Profi";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Dein personalisierter Plan</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">{answers.app_name}</h2>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            {answers.platforms.includes("android") && <Play className="h-4 w-4 text-green-500" />}
            {answers.platforms.includes("ios") && <Apple className="h-4 w-4" />}
            {answers.platforms.length === 2 ? "Android & iOS" : answers.platforms[0]}
          </span>
          <span>|</span>
          <span>{getLevelLabel()}-Modus</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-primary">{totalItems}</div>
          <div className="text-sm text-muted-foreground">Schritte</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-primary flex items-center justify-center gap-1">
            <Clock className="h-6 w-6" />
            {estimatedDays}
          </div>
          <div className="text-sm text-muted-foreground">Tage (geschätzt)</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-primary">
            {checklistSummary.length}
          </div>
          <div className="text-sm text-muted-foreground">Kategorien</div>
        </div>
      </div>

      {/* Checklist Categories */}
      <div className="space-y-3">
        {checklistSummary.map(({ category, items }) => {
          const info = CATEGORY_INFO[category];
          const isExpanded = expandedCategory === category;

          return (
            <div key={category} className="glass rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className="w-full p-4 flex items-center justify-between hover:bg-background/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={info.color}>{info.icon}</span>
                  <span className="font-medium">{info.label}</span>
                  <span className="text-sm text-muted-foreground">
                    ({items.length} Schritte)
                  </span>
                </div>
                <ArrowRight
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-white/10 p-4 space-y-2">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
                        <span className="text-xs">{i + 1}</span>
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div className="glass rounded-xl p-4 bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">Tipps für dich</span>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          Zurück
        </Button>
        <Button onClick={onConfirm} disabled={isCreating} className="gap-2">
          {isCreating ? (
            "Projekt wird erstellt..."
          ) : (
            <>
              Projekt erstellen
              <Rocket className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
