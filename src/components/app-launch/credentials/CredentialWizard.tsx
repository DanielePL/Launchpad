import { useState, useMemo } from "react";
import { useOrgCredentials } from "@/hooks/useAppLaunch";
import {
  CREDENTIAL_TYPES,
  CREDENTIAL_CATEGORIES,
} from "@/api/types/appLaunch";
import type {
  Platform,
  CredentialCategory,
  CredentialTypeDefinition,
  StoreCredential,
} from "@/api/types/appLaunch";
import { CredentialCategoryCard } from "./CredentialCategoryCard";
import { CredentialSetupForm } from "./CredentialSetupForm";
import { CredentialStatusBadge } from "./CredentialStatusBadge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ChevronRight,
  Play,
  Apple,
  Flame,
  Bug,
  Bell,
  CreditCard,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

type WizardView = "overview" | "category" | "setup";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Play: <Play className="h-5 w-5" />,
  Apple: <Apple className="h-5 w-5" />,
  Flame: <Flame className="h-5 w-5" />,
  Bug: <Bug className="h-5 w-5" />,
  Bell: <Bell className="h-5 w-5" />,
  CreditCard: <CreditCard className="h-5 w-5" />,
  Megaphone: <Megaphone className="h-5 w-5" />,
};

interface CredentialWizardProps {
  projectId: string;
  platforms: Platform[];
}

export function CredentialWizard({ platforms }: CredentialWizardProps) {
  const { data: credentials, isLoading } = useOrgCredentials();

  const [view, setView] = useState<WizardView>("overview");
  const [selectedCategory, setSelectedCategory] = useState<CredentialCategory | null>(null);
  const [selectedType, setSelectedType] = useState<CredentialTypeDefinition | null>(null);

  // Filter credential types by project platforms
  const filteredTypes = useMemo(
    () =>
      CREDENTIAL_TYPES.filter((ct) =>
        ct.targetPlatforms.some((tp) => platforms.includes(tp))
      ),
    [platforms]
  );

  // Group by category
  const typesPerCategory = useMemo(() => {
    const map = new Map<CredentialCategory, CredentialTypeDefinition[]>();
    for (const ct of filteredTypes) {
      const list = map.get(ct.category) || [];
      list.push(ct);
      map.set(ct.category, list);
    }
    return map;
  }, [filteredTypes]);

  // Match existing credentials to types
  const credentialByType = useMemo(() => {
    const map = new Map<string, StoreCredential>();
    if (credentials) {
      for (const c of credentials) {
        map.set(c.credential_type, c);
      }
    }
    return map;
  }, [credentials]);

  const getConfiguredCount = (category: CredentialCategory) => {
    const types = typesPerCategory.get(category) || [];
    return types.filter((t) => credentialByType.has(t.key)).length;
  };

  const handleCategoryClick = (category: CredentialCategory) => {
    setSelectedCategory(category);
    setView("category");
  };

  const handleTypeClick = (typeDef: CredentialTypeDefinition) => {
    setSelectedType(typeDef);
    setView("setup");
  };

  const handleBack = () => {
    if (view === "setup") {
      setSelectedType(null);
      setView("category");
    } else if (view === "category") {
      setSelectedCategory(null);
      setView("overview");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Lade Credentials...
      </div>
    );
  }

  // Breadcrumb
  const breadcrumb = (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <button
        onClick={() => {
          setView("overview");
          setSelectedCategory(null);
          setSelectedType(null);
        }}
        className={cn(
          "hover:text-foreground transition-colors",
          view === "overview" && "text-foreground font-medium"
        )}
      >
        API Keys
      </button>
      {selectedCategory && (
        <>
          <ChevronRight className="h-3 w-3" />
          <button
            onClick={() => {
              setView("category");
              setSelectedType(null);
            }}
            className={cn(
              "hover:text-foreground transition-colors",
              view === "category" && "text-foreground font-medium"
            )}
          >
            {CREDENTIAL_CATEGORIES.find((c) => c.key === selectedCategory)?.name}
          </button>
        </>
      )}
      {selectedType && (
        <>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">
            {selectedType.name}
          </span>
        </>
      )}
    </div>
  );

  // Overview: Category Grid
  if (view === "overview") {
    return (
      <div>
        {breadcrumb}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CREDENTIAL_CATEGORIES.map((cat) => {
            const totalCount = (typesPerCategory.get(cat.key) || []).length;
            if (totalCount === 0) return null;
            return (
              <CredentialCategoryCard
                key={cat.key}
                category={cat.key}
                name={cat.name}
                configuredCount={getConfiguredCount(cat.key)}
                totalCount={totalCount}
                required={cat.required}
                onClick={() => handleCategoryClick(cat.key)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Category: List credentials in this category
  if (view === "category" && selectedCategory) {
    const categoryTypes = typesPerCategory.get(selectedCategory) || [];
    const categoryDef = CREDENTIAL_CATEGORIES.find((c) => c.key === selectedCategory);

    return (
      <div>
        {breadcrumb}

        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>

        <div className="space-y-3">
          {categoryTypes.map((typeDef) => {
            const existing = credentialByType.get(typeDef.key);
            const status = existing
              ? existing.is_valid
                ? "configured"
                : "invalid"
              : "missing";

            return (
              <button
                key={typeDef.key}
                onClick={() => handleTypeClick(typeDef)}
                className="glass rounded-xl p-4 w-full text-left hover:border-primary/30 transition-all flex items-center gap-4"
              >
                <span
                  className={cn(
                    "flex-shrink-0",
                    status === "configured"
                      ? "text-green-500"
                      : status === "invalid"
                        ? "text-red-500"
                        : "text-muted-foreground"
                  )}
                >
                  {TYPE_ICONS[typeDef.icon] || <Bell className="h-5 w-5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{typeDef.name}</h4>
                    <div className="flex gap-1">
                      {typeDef.targetPlatforms.map((p) => (
                        <span
                          key={p}
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full",
                            p === "android"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-blue-500/20 text-blue-500"
                          )}
                        >
                          {p === "android" ? "Android" : "iOS"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {typeDef.description}
                  </p>
                </div>
                <CredentialStatusBadge status={status as "configured" | "missing" | "invalid"} />
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Setup: Form for a specific credential
  if (view === "setup" && selectedType) {
    const existing = credentialByType.get(selectedType.key);

    return (
      <div>
        {breadcrumb}

        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>

        <CredentialSetupForm
          definition={selectedType}
          existingCredential={existing}
        />
      </div>
    );
  }

  return null;
}
