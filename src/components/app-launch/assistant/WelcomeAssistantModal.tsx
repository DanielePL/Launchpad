import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Rocket,
  Sparkles,
  Send,
  Loader2,
  Check,
  Code,
  Store,
  FileText,
  Github,
  FileQuestion,
  GitBranch,
  Cloud,
  HardDrive,
  Users,
  Globe,
  DollarSign,
  Shield,
  Calendar,
  Tag,
  Gamepad2,
  Briefcase,
  Heart,
  GraduationCap,
  Music,
  Camera,
  ShoppingBag,
  MessageCircle,
  Utensils,
  Plane,
  Dumbbell,
  Palette,
  Baby,
  Building,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle,
  Wand2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { aiGenerationService } from "@/api/services/aiGenerationService";
import { toast } from "sonner";
import { useCreateAppProject } from "@/hooks/useAppLaunch";
import { appLaunchEndpoints } from "@/api/endpoints/appLaunch";
import type { Platform } from "@/api/types/appLaunch";

interface WelcomeAssistantModalProps {
  open: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

// =============================================================================
// Types & Constants
// =============================================================================

type Phase =
  | "intro"
  | "name"
  | "code_source"
  | "platforms"
  | "store_accounts"
  | "category"
  | "short_description"
  | "full_description"
  | "target_audience"
  | "content_rating"
  | "monetization"
  | "privacy"
  | "countries"
  | "launch_date"
  | "summary";

type CodeSourceType = "github" | "gitlab" | "bitbucket" | "azure" | "local" | "cloud" | "none";
type ContentRating = "everyone" | "teen" | "mature";
type MonetizationType = "free" | "paid" | "freemium" | "subscription";

interface CollectedData {
  app_name?: string;
  code_sources?: CodeSourceType[];
  github_url?: string;
  platforms?: string[];
  store_accounts?: { google?: boolean; apple?: boolean };
  category?: string;
  short_description?: string;
  full_description?: string;
  target_age?: string[];
  content_rating?: ContentRating;
  has_ads?: boolean;
  has_iap?: boolean;
  monetization?: MonetizationType;
  price?: string;
  privacy_url?: string;
  has_privacy_policy?: boolean;
  generated_privacy_policy?: string;
  countries?: string[];
  launch_date?: string;
  beta_testing?: boolean;
}

// AI Generation using real Anthropic Claude API

const CODE_SOURCE_OPTIONS: { id: CodeSourceType; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "github", label: "GitHub", icon: <Github className="h-5 w-5" />, description: "GitHub Repository" },
  { id: "gitlab", label: "GitLab", icon: <GitBranch className="h-5 w-5" />, description: "GitLab Repository" },
  { id: "bitbucket", label: "Bitbucket", icon: <GitBranch className="h-5 w-5" />, description: "Atlassian Bitbucket" },
  { id: "azure", label: "Azure DevOps", icon: <Cloud className="h-5 w-5" />, description: "Microsoft Azure Repos" },
  { id: "local", label: "Lokal", icon: <HardDrive className="h-5 w-5" />, description: "Auf meinem Computer" },
  { id: "cloud", label: "Cloud Storage", icon: <Cloud className="h-5 w-5" />, description: "Dropbox, Drive, iCloud" },
  { id: "none", label: "Kein Code", icon: <FileQuestion className="h-5 w-5" />, description: "Noch nicht vorhanden" },
];

const CATEGORY_OPTIONS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: "games", label: "Spiele", icon: <Gamepad2 className="h-5 w-5" /> },
  { id: "business", label: "Business", icon: <Briefcase className="h-5 w-5" /> },
  { id: "education", label: "Bildung", icon: <GraduationCap className="h-5 w-5" /> },
  { id: "lifestyle", label: "Lifestyle", icon: <Heart className="h-5 w-5" /> },
  { id: "health", label: "Gesundheit & Fitness", icon: <Dumbbell className="h-5 w-5" /> },
  { id: "social", label: "Soziale Netzwerke", icon: <MessageCircle className="h-5 w-5" /> },
  { id: "entertainment", label: "Unterhaltung", icon: <Music className="h-5 w-5" /> },
  { id: "productivity", label: "Produktivität", icon: <Briefcase className="h-5 w-5" /> },
  { id: "shopping", label: "Shopping", icon: <ShoppingBag className="h-5 w-5" /> },
  { id: "food", label: "Essen & Trinken", icon: <Utensils className="h-5 w-5" /> },
  { id: "travel", label: "Reisen", icon: <Plane className="h-5 w-5" /> },
  { id: "photo", label: "Foto & Video", icon: <Camera className="h-5 w-5" /> },
  { id: "finance", label: "Finanzen", icon: <DollarSign className="h-5 w-5" /> },
  { id: "kids", label: "Kinder", icon: <Baby className="h-5 w-5" /> },
  { id: "utilities", label: "Dienstprogramme", icon: <Building className="h-5 w-5" /> },
  { id: "art", label: "Kunst & Design", icon: <Palette className="h-5 w-5" /> },
];

const AGE_OPTIONS = [
  { id: "all", label: "Alle Altersgruppen" },
  { id: "children", label: "Kinder (unter 13)" },
  { id: "teens", label: "Teenager (13-17)" },
  { id: "adults", label: "Erwachsene (18+)" },
];

const COUNTRY_PRESETS = [
  { id: "worldwide", label: "🌍 Weltweit", countries: ["worldwide"] },
  { id: "dach", label: "🇩🇪🇦🇹🇨🇭 DACH", countries: ["DE", "AT", "CH"] },
  { id: "europe", label: "🇪🇺 Europa", countries: ["EU"] },
  { id: "usa", label: "🇺🇸 USA", countries: ["US"] },
  { id: "english", label: "🌐 Englischsprachig", countries: ["US", "GB", "CA", "AU"] },
];

const PHASES_CONFIG: { id: Phase; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "name", label: "App Name", icon: Sparkles },
  { id: "code_source", label: "Code", icon: Code },
  { id: "platforms", label: "Plattformen", icon: Store },
  { id: "store_accounts", label: "Accounts", icon: FileText },
  { id: "category", label: "Kategorie", icon: Tag },
  { id: "short_description", label: "Kurzbeschreibung", icon: FileText },
  { id: "full_description", label: "Beschreibung", icon: FileText },
  { id: "target_audience", label: "Zielgruppe", icon: Users },
  { id: "content_rating", label: "Altersfreigabe", icon: Shield },
  { id: "monetization", label: "Monetarisierung", icon: DollarSign },
  { id: "privacy", label: "Datenschutz", icon: Shield },
  { id: "countries", label: "Länder", icon: Globe },
  { id: "launch_date", label: "Launch", icon: Calendar },
  { id: "summary", label: "Übersicht", icon: Rocket },
];

// =============================================================================
// Sub-Components
// =============================================================================

// Chat bubble from assistant
function AssistantMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-4 flex-1">
        {children}
      </div>
    </div>
  );
}

// Code Source Phase Component
function CodeSourcePhase({
  appName,
  isLoading,
  onComplete,
}: {
  appName: string;
  isLoading: boolean;
  onComplete: (sources: CodeSourceType[], githubUrl?: string) => void;
}) {
  const [selected, setSelected] = useState<CodeSourceType[]>([]);
  const [githubUrl, setGithubUrl] = useState("");
  const [showGithubInput, setShowGithubInput] = useState(false);

  const toggleSource = (source: CodeSourceType) => {
    if (source === "none") {
      setSelected(["none"]);
      setShowGithubInput(false);
      return;
    }

    setSelected(prev => {
      const withoutNone = prev.filter(s => s !== "none");
      if (withoutNone.includes(source)) {
        if (source === "github") setShowGithubInput(false);
        return withoutNone.filter(s => s !== source);
      }
      if (source === "github") setShowGithubInput(true);
      return [...withoutNone, source];
    });
  };

  const isValidGithubUrl = (url: string) => {
    return !url || url.match(/^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/);
  };

  const canContinue = selected.length > 0 &&
    (!selected.includes("github") || !showGithubInput || githubUrl === "" || isValidGithubUrl(githubUrl));

  return (
    <div className="space-y-4">
      <AssistantMessage>
        <p className="text-sm">
          <span className="font-semibold text-primary">{appName}</span> – gefällt mir! ✨
        </p>
        <p className="text-sm mt-2 font-medium">Wo liegt dein App-Code?</p>
        <p className="text-xs text-muted-foreground mt-1">Du kannst mehrere auswählen</p>
      </AssistantMessage>

      <div className="grid grid-cols-2 gap-2 ml-11">
        {CODE_SOURCE_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <Button
              key={option.id}
              variant="outline"
              className={cn(
                "h-auto py-3 px-4 justify-start gap-3 transition-all",
                isSelected && "border-primary bg-primary/10 text-primary",
                option.id === "none" && isSelected && "border-orange-500 bg-orange-500/10 text-orange-600"
              )}
              onClick={() => toggleSource(option.id)}
              disabled={isLoading}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isSelected ? "bg-primary/20" : "bg-muted"
              )}>
                {option.icon}
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
              {isSelected && <Check className="h-4 w-4" />}
            </Button>
          );
        })}
      </div>

      {/* GitHub URL Input */}
      {showGithubInput && (
        <div className="ml-11 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="p-3 rounded-lg bg-muted/50 border border-white/10">
            <p className="text-sm font-medium flex items-center gap-2 mb-2">
              <Github className="h-4 w-4" />
              Repository URL (optional)
            </p>
            <Input
              type="url"
              placeholder="https://github.com/username/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className={cn(
                githubUrl && !isValidGithubUrl(githubUrl) && "border-red-500"
              )}
            />
            {githubUrl && !isValidGithubUrl(githubUrl) && (
              <p className="text-xs text-red-500 mt-1">Ungültige GitHub URL</p>
            )}
            {githubUrl && isValidGithubUrl(githubUrl) && (
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <Check className="h-3 w-3" /> Gültige URL
              </p>
            )}
          </div>
        </div>
      )}

      <div className="ml-11">
        <Button
          className="w-full"
          onClick={() => onComplete(selected, githubUrl || undefined)}
          disabled={!canContinue || isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          Weiter
        </Button>
      </div>
    </div>
  );
}

// Store Accounts Phase Component
function StoreAccountsPhase({
  platforms,
  isLoading,
  onComplete,
}: {
  platforms: string[];
  isLoading: boolean;
  onComplete: (accounts: { google?: boolean; apple?: boolean }) => void;
}) {
  const [accounts, setAccounts] = useState<{ google?: boolean; apple?: boolean }>({});

  const needsGoogle = platforms.includes("android");
  const needsApple = platforms.includes("ios");
  const canContinue = (!needsGoogle || accounts.google !== undefined) && (!needsApple || accounts.apple !== undefined);

  return (
    <div className="space-y-4">
      <AssistantMessage>
        <p className="text-sm">
          {platforms.length === 2 ? "Beide Plattformen" : platforms[0] === "android" ? "Android" : "iOS"} – gute Wahl! 🎯
        </p>
        <p className="text-sm mt-2 font-medium">Hast du bereits Developer-Accounts?</p>
      </AssistantMessage>

      <div className="space-y-3 ml-11">
        {needsGoogle && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <span className="text-lg">🟢</span> Google Play Console
              <span className="text-xs text-muted-foreground">($25 einmalig)</span>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn("flex-1", accounts.google === true && "border-green-500 bg-green-500/10")}
                onClick={() => setAccounts(prev => ({ ...prev, google: true }))}
              >
                {accounts.google === true && <Check className="h-4 w-4 mr-2" />}
                Ja, habe ich
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn("flex-1", accounts.google === false && "border-orange-500 bg-orange-500/10")}
                onClick={() => setAccounts(prev => ({ ...prev, google: false }))}
              >
                {accounts.google === false && <Check className="h-4 w-4 mr-2" />}
                Nein
              </Button>
            </div>
          </div>
        )}

        {needsApple && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <span className="text-lg">🍎</span> Apple Developer Program
              <span className="text-xs text-muted-foreground">($99/Jahr)</span>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn("flex-1", accounts.apple === true && "border-green-500 bg-green-500/10")}
                onClick={() => setAccounts(prev => ({ ...prev, apple: true }))}
              >
                {accounts.apple === true && <Check className="h-4 w-4 mr-2" />}
                Ja, habe ich
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn("flex-1", accounts.apple === false && "border-orange-500 bg-orange-500/10")}
                onClick={() => setAccounts(prev => ({ ...prev, apple: false }))}
              >
                {accounts.apple === false && <Check className="h-4 w-4 mr-2" />}
                Nein
              </Button>
            </div>
          </div>
        )}

        <Button className="w-full mt-2" onClick={() => onComplete(accounts)} disabled={!canContinue || isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          Weiter
        </Button>
      </div>
    </div>
  );
}

// Category Selection Phase
function CategoryPhase({
  isLoading,
  onComplete,
}: {
  isLoading: boolean;
  onComplete: (category: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <AssistantMessage>
        <p className="text-sm">Super! Jetzt zu den App-Details. 📝</p>
        <p className="text-sm mt-2 font-medium">In welche Kategorie passt deine App?</p>
      </AssistantMessage>

      <div className="grid grid-cols-2 gap-2 ml-11 max-h-[280px] overflow-y-auto pr-2">
        {CATEGORY_OPTIONS.map((cat) => (
          <Button
            key={cat.id}
            variant="outline"
            className={cn(
              "h-auto py-2 px-3 justify-start gap-2",
              selected === cat.id && "border-primary bg-primary/10"
            )}
            onClick={() => setSelected(cat.id)}
          >
            {cat.icon}
            <span className="text-sm">{cat.label}</span>
            {selected === cat.id && <Check className="h-4 w-4 ml-auto" />}
          </Button>
        ))}
      </div>

      <div className="ml-11">
        <Button className="w-full" onClick={() => selected && onComplete(selected)} disabled={!selected || isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          Weiter
        </Button>
      </div>
    </div>
  );
}

// Short Description Phase
function ShortDescriptionPhase({
  appName,
  category,
  isLoading,
  onComplete,
}: {
  appName: string;
  category: string;
  isLoading: boolean;
  onComplete: (description: string) => void;
}) {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const maxLength = 80;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await aiGenerationService.generateShortDescription({
        appName,
        category,
      });
      setText(generated.slice(0, maxLength));
      toast.success("Beschreibung generiert!");
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Fehler bei der AI-Generierung");
      // Fallback to simple template
      setText(`${appName} – Deine neue Lieblings-App`.slice(0, maxLength));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <AssistantMessage>
        <p className="text-sm">Perfekt! 🎯</p>
        <p className="text-sm mt-2 font-medium">Beschreibe <span className="text-primary">{appName}</span> in einem Satz:</p>
        <p className="text-xs text-muted-foreground mt-1">Max. 80 Zeichen – wird im Store unter dem App-Namen angezeigt</p>
      </AssistantMessage>

      <div className="ml-11 space-y-2">
        <div className="relative">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxLength))}
            placeholder="z.B. Fitness-Tracker für tägliche Workouts"
            className="pr-16"
          />
          <span className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-xs",
            text.length >= maxLength ? "text-red-500" : "text-muted-foreground"
          )}>
            {text.length}/{maxLength}
          </span>
        </div>

        {/* AI Generate Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-primary border-primary/30 hover:bg-primary/10"
          onClick={handleGenerate}
          disabled={isGenerating || isLoading}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              AI generiert...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              AI Vorschlag generieren
            </>
          )}
        </Button>

        <Button className="w-full" onClick={() => onComplete(text)} disabled={text.length < 10 || isLoading || isGenerating}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          Weiter
        </Button>
      </div>
    </div>
  );
}

// Full Description Phase
function FullDescriptionPhase({
  appName,
  shortDescription,
  category,
  isLoading,
  onComplete,
}: {
  appName: string;
  shortDescription: string;
  category: string;
  isLoading: boolean;
  onComplete: (description: string) => void;
}) {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const maxLength = 4000;
  const minLength = 100;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await aiGenerationService.generateFullDescription({
        appName,
        category,
        shortDescription,
      });
      setText(generated.slice(0, maxLength));
      toast.success("Beschreibung generiert!");
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Fehler bei der AI-Generierung");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      <AssistantMessage>
        <p className="text-sm">„{shortDescription}" – kurz und knackig! ✨</p>
        <p className="text-sm mt-2 font-medium">Jetzt die ausführliche Beschreibung:</p>
        <p className="text-xs text-muted-foreground mt-1">Was macht {appName} besonders? Features, Vorteile, etc.</p>
      </AssistantMessage>

      <div className="ml-11 space-y-2">
        <div className="relative">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxLength))}
            placeholder={`${appName} ist eine App, die...\n\n✨ Features:\n• Feature 1\n• Feature 2\n• Feature 3\n\n🎯 Perfekt für...`}
            className="min-h-[180px] resize-none pr-10"
          />
          <div className="absolute right-2 top-2 flex flex-col gap-1">
            {text && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopy}
                title="Kopieren"
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
          <span className={cn(
            "absolute right-3 bottom-3 text-xs",
            text.length >= maxLength ? "text-red-500" : "text-muted-foreground"
          )}>
            {text.length}/{maxLength}
          </span>
        </div>

        {text.length > 0 && text.length < minLength && (
          <p className="text-xs text-orange-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Mindestens {minLength} Zeichen empfohlen
          </p>
        )}

        {/* AI Generate Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-primary border-primary/30 hover:bg-primary/10"
          onClick={handleGenerate}
          disabled={isGenerating || isLoading}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              AI generiert Beschreibung...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              {text ? "Neu generieren" : "AI Beschreibung generieren"}
            </>
          )}
        </Button>

        <Button className="w-full" onClick={() => onComplete(text)} disabled={text.length < 50 || isLoading || isGenerating}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          Weiter
        </Button>
      </div>
    </div>
  );
}

// Target Audience Phase
function TargetAudiencePhase({
  isLoading,
  onComplete,
}: {
  isLoading: boolean;
  onComplete: (ages: string[], hasAds: boolean, hasIAP: boolean) => void;
}) {
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [hasAds, setHasAds] = useState<boolean | null>(null);
  const [hasIAP, setHasIAP] = useState<boolean | null>(null);

  const toggleAge = (age: string) => {
    if (age === "all") {
      setSelectedAges(["all"]);
    } else {
      setSelectedAges(prev => {
        const without = prev.filter(a => a !== "all");
        return without.includes(age) ? without.filter(a => a !== age) : [...without, age];
      });
    }
  };

  const canContinue = selectedAges.length > 0 && hasAds !== null && hasIAP !== null;

  return (
    <div className="space-y-4">
      <AssistantMessage>
        <p className="text-sm">Top! Beschreibung gespeichert. 📝</p>
        <p className="text-sm mt-2 font-medium">Für wen ist die App gedacht?</p>
      </AssistantMessage>

      <div className="ml-11 space-y-4">
        {/* Age groups */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Zielgruppe:</p>
          <div className="grid grid-cols-2 gap-2">
            {AGE_OPTIONS.map((age) => (
              <Button
                key={age.id}
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start",
                  selectedAges.includes(age.id) && "border-primary bg-primary/10"
                )}
                onClick={() => toggleAge(age.id)}
              >
                {selectedAges.includes(age.id) && <Check className="h-4 w-4 mr-2" />}
                {age.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Ads */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Enthält die App Werbung?</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={cn("flex-1", hasAds === true && "border-primary bg-primary/10")}
              onClick={() => setHasAds(true)}
            >
              {hasAds === true && <Check className="h-4 w-4 mr-2" />}
              Ja
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn("flex-1", hasAds === false && "border-primary bg-primary/10")}
              onClick={() => setHasAds(false)}
            >
              {hasAds === false && <Check className="h-4 w-4 mr-2" />}
              Nein
            </Button>
          </div>
        </div>

        {/* In-App Purchases */}
        <div className="space-y-2">
          <p className="text-sm font-medium">In-App-Käufe?</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={cn("flex-1", hasIAP === true && "border-primary bg-primary/10")}
              onClick={() => setHasIAP(true)}
            >
              {hasIAP === true && <Check className="h-4 w-4 mr-2" />}
              Ja
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn("flex-1", hasIAP === false && "border-primary bg-primary/10")}
              onClick={() => setHasIAP(false)}
            >
              {hasIAP === false && <Check className="h-4 w-4 mr-2" />}
              Nein
            </Button>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => onComplete(selectedAges, hasAds!, hasIAP!)}
          disabled={!canContinue || isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          Weiter
        </Button>
      </div>
    </div>
  );
}

// Content Rating Phase
function ContentRatingPhase({
  targetAge,
  isLoading,
  onComplete,
}: {
  targetAge: string[];
  isLoading: boolean;
  onComplete: (rating: ContentRating) => void;
}) {
  const [selected, setSelected] = useState<ContentRating | null>(null);

  // Suggest based on target age
  const suggested = targetAge.includes("children") ? "everyone" : targetAge.includes("adults") ? "mature" : "everyone";

  const options: { id: ContentRating; label: string; description: string; color: string }[] = [
    { id: "everyone", label: "Alle Altersgruppen", description: "USK 0 / PEGI 3 – Keine bedenklichen Inhalte", color: "green" },
    { id: "teen", label: "Teenager (13+)", description: "USK 12 / PEGI 12 – Leichte Gewalt, milde Sprache", color: "yellow" },
    { id: "mature", label: "Erwachsene (17+)", description: "USK 16-18 / PEGI 16-18 – Starke Inhalte", color: "red" },
  ];

  return (
    <div className="space-y-4">
      <AssistantMessage>
        <p className="text-sm">Verstanden! 👥</p>
        <p className="text-sm mt-2 font-medium">Welche Altersfreigabe passt zu deiner App?</p>
        <p className="text-xs text-muted-foreground mt-1">Basierend auf deiner Zielgruppe empfehle ich: <span className="text-primary font-medium">{options.find(o => o.id === suggested)?.label}</span></p>
      </AssistantMessage>

      <div className="ml-11 space-y-2">
        {options.map((opt) => (
          <Button
            key={opt.id}
            variant="outline"
            className={cn(
              "w-full h-auto py-3 justify-start gap-3",
              selected === opt.id && "border-primary bg-primary/10"
            )}
            onClick={() => setSelected(opt.id)}
          >
            <div className={cn(
              "w-3 h-3 rounded-full",
              opt.color === "green" && "bg-green-500",
              opt.color === "yellow" && "bg-yellow-500",
              opt.color === "red" && "bg-red-500"
            )} />
            <div className="text-left flex-1">
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.description}</p>
            </div>
            {selected === opt.id && <Check className="h-4 w-4" />}
            {opt.id === suggested && selected !== opt.id && (
              <span className="text-xs text-primary">Empfohlen</span>
            )}
          </Button>
        ))}

        <Button className="w-full mt-2" onClick={() => selected && onComplete(selected)} disabled={!selected || isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          Weiter
        </Button>
      </div>
    </div>
  );
}

// Monetization Phase
function MonetizationPhase({
  hasIAP,
  isLoading,
  onComplete,
}: {
  hasIAP: boolean;
  isLoading: boolean;
  onComplete: (monetization: MonetizationType, price?: string) => void;
}) {
  const [selected, setSelected] = useState<MonetizationType | null>(null);
  const [price, setPrice] = useState("");

  const options: { id: MonetizationType; label: string; description: string; icon: React.ReactNode }[] = [
    { id: "free", label: "Kostenlos", description: "Gratis ohne Einschränkungen", icon: <span>🆓</span> },
    { id: "freemium", label: "Freemium", description: "Gratis + Premium-Features", icon: <span>⭐</span> },
    { id: "paid", label: "Kostenpflichtig", description: "Einmaliger Kaufpreis", icon: <span>💰</span> },
    { id: "subscription", label: "Abo-Modell", description: "Monatliche/Jährliche Zahlung", icon: <span>🔄</span> },
  ];

  return (
    <div className="space-y-4">
      <AssistantMessage>
        <p className="text-sm">Altersfreigabe gesetzt! ✅</p>
        <p className="text-sm mt-2 font-medium">Wie möchtest du mit {hasIAP ? "In-App-Käufen" : "der App"} Geld verdienen?</p>
      </AssistantMessage>

      <div className="ml-11 space-y-2">
        {options.map((opt) => (
          <Button
            key={opt.id}
            variant="outline"
            className={cn(
              "w-full h-auto py-3 justify-start gap-3",
              selected === opt.id && "border-primary bg-primary/10"
            )}
            onClick={() => setSelected(opt.id)}
          >
            <span className="text-xl">{opt.icon}</span>
            <div className="text-left flex-1">
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.description}</p>
            </div>
            {selected === opt.id && <Check className="h-4 w-4" />}
          </Button>
        ))}

        {selected === "paid" && (
          <div className="pt-2">
            <Input
              type="text"
              placeholder="Preis (z.B. 2,99 €)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        )}

        <Button
          className="w-full mt-2"
          onClick={() => selected && onComplete(selected, price || undefined)}
          disabled={!selected || (selected === "paid" && !price) || isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          Weiter
        </Button>
      </div>
    </div>
  );
}

// Privacy Phase
function PrivacyPhase({
  appName,
  platforms,
  hasAds,
  hasIAP,
  targetAudience,
  isLoading,
  onComplete,
}: {
  appName: string;
  platforms: string[];
  hasAds: boolean;
  hasIAP: boolean;
  targetAudience: string[];
  isLoading: boolean;
  onComplete: (hasPolicy: boolean, url?: string, generatedPolicy?: string) => void;
}) {
  const [hasPolicy, setHasPolicy] = useState<boolean | null>(null);
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPolicy, setGeneratedPolicy] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGeneratePolicy = async () => {
    setIsGenerating(true);
    try {
      const policy = await aiGenerationService.generatePrivacyPolicy({
        appName,
        platforms,
        hasAds,
        hasIAP,
        targetAudience,
      });
      setGeneratedPolicy(policy);
      setShowPreview(true);
      toast.success("Datenschutzerklärung generiert!");
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Fehler bei der AI-Generierung");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <AssistantMessage>
        <p className="text-sm">Monetarisierung notiert! 💰</p>
        <p className="text-sm mt-2 font-medium">Hast du bereits eine Datenschutzerklärung?</p>
        <p className="text-xs text-muted-foreground mt-1">Für den Store-Release zwingend erforderlich</p>
      </AssistantMessage>

      <div className="ml-11 space-y-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className={cn("flex-1", hasPolicy === true && "border-green-500 bg-green-500/10")}
            onClick={() => { setHasPolicy(true); setShowPreview(false); }}
          >
            {hasPolicy === true && <Check className="h-4 w-4 mr-2" />}
            Ja, habe ich
          </Button>
          <Button
            variant="outline"
            className={cn("flex-1", hasPolicy === false && "border-primary bg-primary/10")}
            onClick={() => setHasPolicy(false)}
          >
            {hasPolicy === false && <Check className="h-4 w-4 mr-2" />}
            Nein, brauche ich
          </Button>
        </div>

        {hasPolicy === true && (
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="URL zur Datenschutzerklärung (z.B. example.com/datenschutz)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Diese URL wird im App Store angezeigt
            </p>
          </div>
        )}

        {hasPolicy === false && !showPreview && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
            <p className="text-sm">🤖 Ich generiere dir eine DSGVO-konforme Datenschutzerklärung!</p>
            <p className="text-xs text-muted-foreground">
              Wird in deinem Projekt gespeichert – Homepage-Verlinkung machen wir später.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-primary"
              onClick={handleGeneratePolicy}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generiere...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Jetzt generieren
                </>
              )}
            </Button>
          </div>
        )}

        {showPreview && generatedPolicy && (
          <div className="space-y-2 animate-in slide-in-from-top-2">
            <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/5">
              <p className="text-sm font-medium text-green-600 flex items-center gap-2 mb-2">
                <Check className="h-4 w-4" />
                Datenschutzerklärung generiert!
              </p>
              <div className="max-h-28 overflow-y-auto text-xs text-muted-foreground bg-background/50 p-2 rounded">
                {generatedPolicy.slice(0, 400)}...
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Wird mit deinem Projekt gespeichert
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleGeneratePolicy}
              disabled={isGenerating}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Neu generieren
            </Button>
          </div>
        )}

        <Button
          className="w-full"
          onClick={() => hasPolicy !== null && onComplete(hasPolicy, url || undefined, generatedPolicy || undefined)}
          disabled={hasPolicy === null || (hasPolicy === true && !url) || (hasPolicy === false && !generatedPolicy) || isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          Weiter
        </Button>
      </div>
    </div>
  );
}

// Countries Phase
function CountriesPhase({
  isLoading,
  onComplete,
}: {
  isLoading: boolean;
  onComplete: (countries: string[]) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <AssistantMessage>
        <p className="text-sm">Datenschutz ✓</p>
        <p className="text-sm mt-2 font-medium">In welchen Ländern soll die App verfügbar sein?</p>
      </AssistantMessage>

      <div className="ml-11 space-y-2">
        {COUNTRY_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            className={cn(
              "w-full justify-start",
              selected === preset.id && "border-primary bg-primary/10"
            )}
            onClick={() => setSelected(preset.id)}
          >
            {selected === preset.id && <Check className="h-4 w-4 mr-2" />}
            {preset.label}
          </Button>
        ))}

        <Button
          className="w-full mt-2"
          onClick={() => {
            const preset = COUNTRY_PRESETS.find(p => p.id === selected);
            if (preset) onComplete(preset.countries);
          }}
          disabled={!selected || isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          Weiter
        </Button>
      </div>
    </div>
  );
}

// Launch Date Phase
function LaunchDatePhase({
  isLoading,
  onComplete,
}: {
  isLoading: boolean;
  onComplete: (date: string, betaTesting: boolean) => void;
}) {
  const [timeline, setTimeline] = useState<string | null>(null);
  const [betaTesting, setBetaTesting] = useState<boolean | null>(null);

  const options = [
    { id: "asap", label: "So schnell wie möglich", description: "1-2 Wochen" },
    { id: "month", label: "In ca. einem Monat", description: "Zeit für Beta-Tests" },
    { id: "quarter", label: "In 2-3 Monaten", description: "Ausführliche Vorbereitung" },
    { id: "flexible", label: "Kein festes Datum", description: "Flexibel bleiben" },
  ];

  return (
    <div className="space-y-4">
      <AssistantMessage>
        <p className="text-sm">Fast geschafft! 🏁</p>
        <p className="text-sm mt-2 font-medium">Wann möchtest du launchen?</p>
      </AssistantMessage>

      <div className="ml-11 space-y-3">
        <div className="space-y-2">
          {options.map((opt) => (
            <Button
              key={opt.id}
              variant="outline"
              className={cn(
                "w-full h-auto py-2 justify-start gap-3",
                timeline === opt.id && "border-primary bg-primary/10"
              )}
              onClick={() => setTimeline(opt.id)}
            >
              <div className="text-left flex-1">
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
              {timeline === opt.id && <Check className="h-4 w-4" />}
            </Button>
          ))}
        </div>

        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium">Beta-Testing vor Release?</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={cn("flex-1", betaTesting === true && "border-green-500 bg-green-500/10")}
              onClick={() => setBetaTesting(true)}
            >
              {betaTesting === true && <Check className="h-4 w-4 mr-2" />}
              Ja, gute Idee
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn("flex-1", betaTesting === false && "border-primary bg-primary/10")}
              onClick={() => setBetaTesting(false)}
            >
              {betaTesting === false && <Check className="h-4 w-4 mr-2" />}
              Nein, direkt live
            </Button>
          </div>
        </div>

        <Button
          className="w-full mt-2"
          onClick={() => timeline && betaTesting !== null && onComplete(timeline, betaTesting)}
          disabled={!timeline || betaTesting === null || isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          Weiter
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function WelcomeAssistantModal({ open, onClose }: WelcomeAssistantModalProps) {
  const navigate = useNavigate();
  const createProject = useCreateAppProject();
  const [phase, setPhase] = useState<Phase>("intro");
  const [data, setData] = useState<CollectedData>({});
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Phase[]>([]);

  const handleNext = async (updates: Partial<CollectedData>, nextPhase: Phase) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 300));
    setHistory(prev => [...prev, phase]);
    setData(prev => ({ ...prev, ...updates }));
    setPhase(nextPhase);
    setIsLoading(false);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevPhase = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setPhase(prevPhase);
    }
  };

  const handleClose = (dontShowAgain: boolean = false) => {
    onClose(dontShowAgain);
    // Reset state for next time
    setTimeout(() => {
      setPhase("intro");
      setData({});
      setInputValue("");
      setHistory([]);
    }, 300);
  };

  const handleFinish = async () => {
    setIsLoading(true);

    try {
      // Calculate target launch date from wizard selection
      let targetLaunchDate: string | undefined;
      if (data.launch_date) {
        const now = new Date();
        const daysMap: Record<string, number> = { asap: 14, month: 30, quarter: 90 };
        const days = daysMap[data.launch_date];
        if (days) {
          const target = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
          targetLaunchDate = target.toISOString().split("T")[0];
        }
      }

      // Create project in Supabase
      const project = await createProject.mutateAsync({
        name: data.app_name || "Neue App",
        description: data.short_description || undefined,
        short_description: data.short_description || undefined,
        full_description: data.full_description || undefined,
        platforms: (data.platforms as Platform[]) || ["android", "ios"],
        app_category: data.category || undefined,
        content_rating: data.content_rating || undefined,
        has_play_console: data.store_accounts?.google ?? undefined,
        has_apple_dev: data.store_accounts?.apple ?? undefined,
        target_launch_date: targetLaunchDate,
      });

      if (!project) {
        throw new Error("Projekt konnte nicht erstellt werden");
      }

      // Auto-check matching checklist items
      try {
        const checklist = await appLaunchEndpoints.getProjectChecklist(project.id);

        // Map wizard values to checklist item_keys
        const itemKeysToCheck: string[] = [];
        if (data.app_name) itemKeysToCheck.push("app_title");
        if (data.short_description) itemKeysToCheck.push("short_description");
        if (data.full_description) itemKeysToCheck.push("full_description");
        if (data.category) itemKeysToCheck.push("category");
        if (data.content_rating) itemKeysToCheck.push("content_rating");
        if (data.store_accounts?.google === true) itemKeysToCheck.push("play_console_account");
        if (data.store_accounts?.apple === true) itemKeysToCheck.push("apple_dev_account");
        if (data.has_privacy_policy && data.privacy_url) itemKeysToCheck.push("privacy_policy");

        // Toggle matching items
        const togglePromises = checklist
          .filter((item) => itemKeysToCheck.includes(item.item_key) && !item.is_completed)
          .map((item) => appLaunchEndpoints.toggleChecklistItem(item.id, true));

        await Promise.all(togglePromises);
      } catch (checklistError) {
        // Non-critical: project was created, checklist sync failed
        console.warn("Checklist auto-check failed:", checklistError);
      }

      toast.success(`Projekt "${data.app_name}" erstellt!`);

      // Close modal and navigate to new project
      onClose(false);

      setTimeout(() => {
        setPhase("intro");
        setData({});
        setInputValue("");
        setHistory([]);
        navigate(`/app-launch/project/${project.id}`);
      }, 300);

    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Fehler beim Erstellen des Projekts");
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPhaseIndex = () => PHASES_CONFIG.findIndex(p => p.id === phase);
  const canGoBack = history.length > 0;

  const getPhaseValue = (phaseId: string): string | undefined => {
    switch (phaseId) {
      case "name": return data.app_name;
      case "code_source": return data.code_sources?.map(s => CODE_SOURCE_OPTIONS.find(o => o.id === s)?.label).join(", ");
      case "platforms": return data.platforms?.join(" & ");
      case "store_accounts":
        if (!data.store_accounts) return undefined;
        const parts = [];
        if (data.store_accounts.google) parts.push("Google ✓");
        if (data.store_accounts.apple) parts.push("Apple ✓");
        return parts.length ? parts.join(", ") : "Keine";
      case "category": return CATEGORY_OPTIONS.find(c => c.id === data.category)?.label;
      case "short_description": return data.short_description?.slice(0, 30) + "...";
      case "full_description": return data.full_description ? `${data.full_description.length} Zeichen` : undefined;
      case "target_audience": return data.target_age?.map(a => AGE_OPTIONS.find(o => o.id === a)?.label).join(", ");
      case "content_rating": return data.content_rating === "everyone" ? "Alle" : data.content_rating === "teen" ? "13+" : "17+";
      case "monetization": return data.monetization;
      case "privacy": return data.has_privacy_policy ? "Vorhanden" : "Wird generiert";
      case "countries": return data.countries?.includes("worldwide") ? "Weltweit" : data.countries?.join(", ");
      case "launch_date": return data.launch_date;
      default: return undefined;
    }
  };

  // Intro screen
  if (phase === "intro") {
    return (
      <Dialog open={open} onOpenChange={() => handleClose(false)}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-background border-white/10">
          <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 p-6 pb-8">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="p-6 -mt-4">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Hey! Ich bin dein Launch Assistant 👋</h2>
              <p className="text-muted-foreground mb-6">
                Ich führe dich <span className="text-foreground font-medium">Schritt für Schritt</span> durch
                den kompletten App-Launch-Prozess. Du siehst immer nur eine Frage –
                ich kümmere mich um den Rest.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6 text-left">
                <div className="p-3 rounded-lg bg-background/50 border border-white/10">
                  <Sparkles className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs font-medium">AI generiert alles</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-white/10">
                  <Rocket className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs font-medium">Zero Overwhelm</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-white/10">
                  <Bot className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs font-medium">Jederzeit pausierbar</p>
                </div>
              </div>

              <Button onClick={() => setPhase("name")} className="w-full gap-2" size="lg">
                Los geht's
                <Rocket className="h-4 w-4" />
              </Button>

              {/* Dismiss options */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleClose(false)}
                >
                  Später
                </Button>
                <span className="text-muted-foreground text-xs">•</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleClose(true)}
                >
                  Nicht mehr anzeigen
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Main assistant view with split layout
  return (
    <Dialog open={open} onOpenChange={() => handleClose(false)}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-background border-white/10 h-[650px]">
        <div className="flex h-full">
          {/* Left side - Chat */}
          <div className="flex-1 flex flex-col border-r border-white/10">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              {canGoBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="mr-1"
                  disabled={isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Launch Assistant</h3>
                <p className="text-xs text-muted-foreground">
                  Schritt {getCurrentPhaseIndex() + 1} von {PHASES_CONFIG.length}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleClose(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Name phase */}
              {phase === "name" && (
                <div className="space-y-4">
                  <AssistantMessage>
                    <p className="text-sm">Super! Lass uns starten. 🚀</p>
                    <p className="text-sm mt-2 font-medium">Wie heißt deine App?</p>
                  </AssistantMessage>
                  <div className="ml-11">
                    <div className="flex gap-2">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && inputValue.trim() && handleNext({ app_name: inputValue.trim() }, "code_source")}
                        placeholder="z.B. FitTracker, MyShop, ..."
                        autoFocus
                      />
                      <Button
                        onClick={() => handleNext({ app_name: inputValue.trim() }, "code_source")}
                        disabled={!inputValue.trim() || isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {phase === "code_source" && (
                <CodeSourcePhase
                  appName={data.app_name || ""}
                  isLoading={isLoading}
                  onComplete={(sources, githubUrl) => handleNext({ code_sources: sources, github_url: githubUrl }, "platforms")}
                />
              )}

              {phase === "platforms" && (
                <div className="space-y-4">
                  <AssistantMessage>
                    <p className="text-sm">
                      {data.code_sources?.includes("none")
                        ? "Kein Code – kein Problem!"
                        : `${data.code_sources?.map(s => CODE_SOURCE_OPTIONS.find(o => o.id === s)?.label).join(" + ")} – notiert!`} 👍
                    </p>
                    <p className="text-sm mt-2 font-medium">Auf welchen Plattformen soll die App erscheinen?</p>
                  </AssistantMessage>
                  <div className="grid grid-cols-3 gap-3 ml-11">
                    {[
                      { id: ["android"], label: "Android", emoji: "🤖" },
                      { id: ["ios"], label: "iOS", emoji: "🍎" },
                      { id: ["android", "ios"], label: "Beide", emoji: "📱" },
                    ].map((opt) => (
                      <Button
                        key={opt.label}
                        variant="outline"
                        className="h-20 flex-col gap-2 hover:border-primary"
                        onClick={() => handleNext({ platforms: opt.id }, "store_accounts")}
                        disabled={isLoading}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-xs">{opt.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {phase === "store_accounts" && (
                <StoreAccountsPhase
                  platforms={data.platforms || []}
                  isLoading={isLoading}
                  onComplete={(accounts) => handleNext({ store_accounts: accounts }, "category")}
                />
              )}

              {phase === "category" && (
                <CategoryPhase
                  isLoading={isLoading}
                  onComplete={(category) => handleNext({ category }, "short_description")}
                />
              )}

              {phase === "short_description" && (
                <ShortDescriptionPhase
                  appName={data.app_name || ""}
                  category={data.category || ""}
                  isLoading={isLoading}
                  onComplete={(desc) => handleNext({ short_description: desc }, "full_description")}
                />
              )}

              {phase === "full_description" && (
                <FullDescriptionPhase
                  appName={data.app_name || ""}
                  shortDescription={data.short_description || ""}
                  category={data.category || ""}
                  isLoading={isLoading}
                  onComplete={(desc) => handleNext({ full_description: desc }, "target_audience")}
                />
              )}

              {phase === "target_audience" && (
                <TargetAudiencePhase
                  isLoading={isLoading}
                  onComplete={(ages, hasAds, hasIAP) =>
                    handleNext({ target_age: ages, has_ads: hasAds, has_iap: hasIAP }, "content_rating")
                  }
                />
              )}

              {phase === "content_rating" && (
                <ContentRatingPhase
                  targetAge={data.target_age || []}
                  isLoading={isLoading}
                  onComplete={(rating) => handleNext({ content_rating: rating }, "monetization")}
                />
              )}

              {phase === "monetization" && (
                <MonetizationPhase
                  hasIAP={data.has_iap || false}
                  isLoading={isLoading}
                  onComplete={(monetization, price) => handleNext({ monetization, price }, "privacy")}
                />
              )}

              {phase === "privacy" && (
                <PrivacyPhase
                  appName={data.app_name || ""}
                  platforms={data.platforms || []}
                  hasAds={data.has_ads || false}
                  hasIAP={data.has_iap || false}
                  targetAudience={data.target_age || []}
                  isLoading={isLoading}
                  onComplete={(hasPolicy, url, generatedPolicy) =>
                    handleNext({
                      has_privacy_policy: hasPolicy,
                      privacy_url: url,
                      generated_privacy_policy: generatedPolicy,
                    }, "countries")
                  }
                />
              )}

              {phase === "countries" && (
                <CountriesPhase
                  isLoading={isLoading}
                  onComplete={(countries) => handleNext({ countries }, "launch_date")}
                />
              )}

              {phase === "launch_date" && (
                <LaunchDatePhase
                  isLoading={isLoading}
                  onComplete={(date, beta) => handleNext({ launch_date: date, beta_testing: beta }, "summary")}
                />
              )}

              {phase === "summary" && (
                <div className="space-y-4">
                  <AssistantMessage>
                    <p className="text-sm">🎉 <span className="font-semibold">Perfekt!</span> Ich habe alles, was ich brauche.</p>
                    <p className="text-sm mt-2">
                      Dein Projekt <span className="font-semibold text-primary">{data.app_name}</span> wird jetzt erstellt!
                    </p>
                  </AssistantMessage>

                  {/* Summary Cards */}
                  <div className="ml-11 space-y-3">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <p className="text-sm font-medium text-green-600 mb-2 flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Was ich für dich vorbereitet habe:
                      </p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <FileText className="h-3 w-3" /> Kurzbeschreibung ({data.short_description?.length || 0} Zeichen)
                        </li>
                        <li className="flex items-center gap-2">
                          <FileText className="h-3 w-3" /> Store-Beschreibung ({data.full_description?.length || 0} Zeichen)
                        </li>
                        {data.generated_privacy_policy && (
                          <li className="flex items-center gap-2">
                            <Shield className="h-3 w-3" /> Datenschutzerklärung (DSGVO-konform)
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg bg-background/50 border border-white/10">
                      <p className="text-sm font-medium mb-2">📋 Nächste Schritte:</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• App-Icon & Screenshots hochladen</li>
                        {data.generated_privacy_policy && (
                          <li>• Datenschutzerklärung auf Homepage laden</li>
                        )}
                        {data.beta_testing && <li>• Beta-Tester einladen</li>}
                        <li>• App zur Prüfung einreichen</li>
                      </ul>
                    </div>

                    <Button onClick={handleFinish} className="w-full gap-2" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Speichere...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4" />
                          Projekt erstellen
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Protocol */}
          <div className="w-72 bg-muted/30 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h3 className="font-semibold text-sm">📋 Projekt-Protokoll</h3>
              <p className="text-xs text-muted-foreground mt-1">{data.app_name || "Neue App"}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {PHASES_CONFIG.map((p, index) => {
                const isCompleted = getCurrentPhaseIndex() > index;
                const isCurrent = p.id === phase;
                const Icon = p.icon;
                const value = getPhaseValue(p.id);

                return (
                  <div
                    key={p.id}
                    className={cn(
                      "p-2 rounded-lg border transition-all",
                      isCurrent && "border-primary bg-primary/5",
                      isCompleted && "border-green-500/30 bg-green-500/5",
                      !isCurrent && !isCompleted && "border-transparent opacity-40"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <Icon className={cn("h-4 w-4 flex-shrink-0", isCurrent ? "text-primary" : "text-muted-foreground")} />
                      )}
                      <span className={cn("text-xs font-medium flex-1", isCompleted && "text-green-600")}>
                        {p.label}
                      </span>
                    </div>
                    {value && (
                      <p className="text-xs text-muted-foreground ml-6 mt-0.5 truncate">{value}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Fortschritt</span>
                <span>{Math.round((getCurrentPhaseIndex() / PHASES_CONFIG.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
                  style={{ width: `${(getCurrentPhaseIndex() / PHASES_CONFIG.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
