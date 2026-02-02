import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppProject, useAssetRequirements } from "@/hooks/useAppLaunch";
import { Button } from "@/components/ui/button";
import {
  ScreenshotManager,
  IconManager,
  FeatureGraphicManager,
  AssetRequirementsPanel,
} from "@/components/app-launch/assets";
import {
  ArrowLeft,
  Image,
  AppWindow,
  LayoutGrid,
  Smartphone,
  Play,
  Apple,
} from "lucide-react";
import type { Platform } from "@/api/types/appLaunch";

type AssetTab = "screenshots" | "icons" | "feature-graphic";

export function AssetStudioPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: projectLoading } = useAppProject(id || "");
  const { data: requirements, isLoading: requirementsLoading } = useAssetRequirements(id || "");

  const [activeTab, setActiveTab] = useState<AssetTab>("screenshots");
  const [platformFilter, setPlatformFilter] = useState<Platform | "both">("both");

  if (projectLoading) {
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
  const showFeatureGraphic = platforms.includes("android");

  const tabs: { id: AssetTab; label: string; icon: React.ReactNode }[] = [
    { id: "screenshots", label: "Screenshots", icon: <Smartphone className="h-4 w-4" /> },
    { id: "icons", label: "Icons", icon: <AppWindow className="h-4 w-4" /> },
    ...(showFeatureGraphic
      ? [{ id: "feature-graphic" as const, label: "Feature Graphic", icon: <LayoutGrid className="h-4 w-4" /> }]
      : []),
  ];

  const filteredPlatforms =
    platformFilter === "both"
      ? platforms
      : platforms.filter((p) => p === platformFilter);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
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
              <Image className="h-6 w-6 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">Asset Studio</h1>
            <p className="text-sm text-muted-foreground">{project.name}</p>
          </div>
        </div>

        {/* Platform Filter (for screenshots) */}
        {platforms.length > 1 && activeTab === "screenshots" && (
          <div className="flex rounded-lg border border-white/10 p-1">
            <Button
              variant={platformFilter === "both" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPlatformFilter("both")}
            >
              Both
            </Button>
            <Button
              variant={platformFilter === "android" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPlatformFilter("android")}
              className="gap-1"
            >
              <Play className="h-3 w-3" />
              Android
            </Button>
            <Button
              variant={platformFilter === "ios" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPlatformFilter("ios")}
              className="gap-1"
            >
              <Apple className="h-3 w-3" />
              iOS
            </Button>
          </div>
        )}
      </div>

      {/* Layout: Main + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tab Navigation */}
          <div className="flex rounded-lg border border-white/10 p-1 w-fit">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="gap-2"
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="glass rounded-xl p-6">
            {activeTab === "screenshots" && (
              <ScreenshotManager
                projectId={id!}
                platforms={
                  platformFilter === "both"
                    ? filteredPlatforms
                    : [platformFilter]
                }
              />
            )}
            {activeTab === "icons" && (
              <IconManager projectId={id!} platforms={platforms} />
            )}
            {activeTab === "feature-graphic" && showFeatureGraphic && (
              <FeatureGraphicManager projectId={id!} />
            )}
          </div>
        </div>

        {/* Sidebar: Requirements */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <AssetRequirementsPanel
              status={requirements ?? null}
              platform={platformFilter}
              isLoading={requirementsLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
