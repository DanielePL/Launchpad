import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useAppProject,
  useProjectChecklist,
  useChecklistProgress,
  useToggleChecklistItem,
  CATEGORY_LABELS,
} from "@/hooks/useAppLaunch";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Smartphone,
  Apple,
  Play,
  Bot,
  Settings,
  FileText,
  Image,
  Shield,
  Users,
  Rocket,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChecklistCategory } from "@/api/types/appLaunch";

const CATEGORY_ICONS: Record<ChecklistCategory, React.ReactNode> = {
  setup: <Settings className="h-4 w-4" />,
  store_listing: <FileText className="h-4 w-4" />,
  assets: <Image className="h-4 w-4" />,
  compliance: <Shield className="h-4 w-4" />,
  beta: <Users className="h-4 w-4" />,
  release: <Rocket className="h-4 w-4" />,
};

export function AppProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: projectLoading } = useAppProject(id || "");
  const { data: checklist, isLoading: checklistLoading } = useProjectChecklist(id || "");
  const { progress, totalProgress } = useChecklistProgress(id || "");
  const toggleItem = useToggleChecklistItem();

  const [expandedCategories, setExpandedCategories] = useState<ChecklistCategory[]>([
    "setup",
    "store_listing",
  ]);

  const toggleCategory = (category: ChecklistCategory) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  if (projectLoading || checklistLoading) {
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

  const categories: ChecklistCategory[] = [
    "setup",
    "store_listing",
    "assets",
    "compliance",
    "beta",
    "release",
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/app-launch">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4 flex-1">
          {project.icon_url ? (
            <img
              src={project.icon_url}
              alt={project.name}
              className="w-14 h-14 rounded-xl"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
              <Smartphone className="h-7 w-7 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                {project.platforms.includes("android") && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Play className="h-3 w-3 text-green-500" /> Android
                  </span>
                )}
                {project.platforms.includes("ios") && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
                    <Apple className="h-3 w-3" /> iOS
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <Link to={`/app-launch/project/${id}/store-listing`}>
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Store Listing
          </Button>
        </Link>
        <Link to={`/app-launch/project/${id}/credentials`}>
          <Button variant="outline" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </Button>
        </Link>
        <Link to={`/app-launch/project/${id}/assets`}>
          <Button variant="outline" className="gap-2">
            <Image className="h-4 w-4" />
            Asset Studio
          </Button>
        </Link>
        <Link to={`/app-launch/assistant?project=${id}`}>
          <Button variant="outline" className="gap-2">
            <Bot className="h-4 w-4" />
            Get AI Help
          </Button>
        </Link>
      </div>

      {/* Progress Overview */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Launch Progress</h2>
          <span className="text-2xl font-bold text-primary">{totalProgress}%</span>
        </div>

        {/* Overall Progress Bar */}
        <div className="h-3 bg-muted rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-primary to-green-500 transition-all"
            style={{ width: `${totalProgress}%` }}
          />
        </div>

        {/* Category Progress */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {progress.map((p) => (
            <div
              key={p.category}
              className={cn(
                "p-3 rounded-lg text-center transition-colors cursor-pointer",
                p.percentage === 100
                  ? "bg-green-500/20"
                  : p.percentage > 0
                    ? "bg-primary/10"
                    : "bg-muted/50"
              )}
              onClick={() => toggleCategory(p.category)}
            >
              <div className="flex justify-center mb-2">
                {p.percentage === 100 ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <span className={p.percentage > 0 ? "text-primary" : "text-muted-foreground"}>
                    {CATEGORY_ICONS[p.category]}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium">{CATEGORY_LABELS[p.category]}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {p.completed}/{p.total}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Suggestion Banner */}
      {totalProgress < 100 && (
        <div className="glass rounded-xl p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">Next step:</span>{" "}
                {checklist?.find((item) => !item.is_completed)?.title || "All done!"}
              </p>
            </div>
            <Link to={`/app-launch/assistant?project=${id}`}>
              <Button size="sm" variant="ghost" className="gap-1">
                <Bot className="h-4 w-4" />
                Ask AI
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Checklist */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryItems = checklist?.filter((item) => item.category === category) || [];
          const isExpanded = expandedCategories.includes(category);
          const completedCount = categoryItems.filter((item) => item.is_completed).length;

          return (
            <div key={category} className="glass rounded-xl overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full p-4 flex items-center justify-between hover:bg-background/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={completedCount === categoryItems.length ? "text-green-500" : "text-primary"}>
                    {CATEGORY_ICONS[category]}
                  </span>
                  <span className="font-semibold">{CATEGORY_LABELS[category]}</span>
                  <span className="text-sm text-muted-foreground">
                    ({completedCount}/{categoryItems.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div className="border-t border-white/10">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-4 flex items-start gap-3 border-b border-white/5 last:border-0",
                        item.is_completed && "opacity-60"
                      )}
                    >
                      <button
                        onClick={() =>
                          toggleItem.mutate({
                            itemId: item.id,
                            completed: !item.is_completed,
                          })
                        }
                        disabled={toggleItem.isPending}
                        className={cn(
                          "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                          item.is_completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-muted-foreground hover:border-primary"
                        )}
                      >
                        {item.is_completed && <Check className="h-3 w-3" />}
                      </button>
                      <div className="flex-1">
                        <p
                          className={cn(
                            "font-medium",
                            item.is_completed && "line-through"
                          )}
                        >
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                        {item.platform && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-xs mt-2 px-2 py-0.5 rounded-full",
                              item.platform === "android"
                                ? "bg-green-500/20 text-green-500"
                                : "bg-blue-500/20 text-blue-500"
                            )}
                          >
                            {item.platform === "android" ? (
                              <Play className="h-3 w-3" />
                            ) : (
                              <Apple className="h-3 w-3" />
                            )}
                            {item.platform === "android" ? "Android" : "iOS"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
