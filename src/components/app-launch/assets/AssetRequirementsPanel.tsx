import { Check, X, AlertCircle, Image, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssetRequirementsStatus, Platform } from "@/api/types/appLaunch";

interface AssetRequirementsPanelProps {
  status: AssetRequirementsStatus | null;
  platform: Platform | "both";
  isLoading?: boolean;
}

export function AssetRequirementsPanel({
  status,
  platform,
  isLoading = false,
}: AssetRequirementsPanelProps) {
  if (isLoading) {
    return (
      <div className="glass rounded-xl p-4 animate-pulse">
        <div className="h-5 bg-muted rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType.includes("tablet") || deviceType.includes("ipad")) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Smartphone className="h-4 w-4" />;
  };

  const renderScreenshotRequirements = (platformKey: Platform) => {
    const requirements = status.screenshots[platformKey];
    if (!requirements || requirements.length === 0) return null;

    const requiredItems = requirements.filter((r) => r.required);
    const optionalItems = requirements.filter((r) => !r.required);
    const allRequiredSatisfied = requiredItems.every((r) => r.is_satisfied);

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          {platformKey === "android" ? "Android Screenshots" : "iOS Screenshots"}
          {allRequiredSatisfied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          )}
        </h4>

        {/* Required */}
        {requiredItems.length > 0 && (
          <div className="space-y-1">
            {requiredItems.map((req) => (
              <div
                key={req.device_type}
                className={cn(
                  "flex items-center justify-between text-sm p-2 rounded-lg",
                  req.is_satisfied ? "bg-green-500/10" : "bg-amber-500/10"
                )}
              >
                <div className="flex items-center gap-2">
                  {getDeviceIcon(req.device_type)}
                  <span>{req.device_name}</span>
                  <span className="text-xs text-muted-foreground">(required)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs",
                      req.is_satisfied ? "text-green-500" : "text-amber-500"
                    )}
                  >
                    {req.uploaded_count} / {req.min_count}+ uploaded
                  </span>
                  {req.is_satisfied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Optional */}
        {optionalItems.length > 0 && (
          <div className="space-y-1">
            {optionalItems.map((req) => (
              <div
                key={req.device_type}
                className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  {getDeviceIcon(req.device_type)}
                  <span className="text-muted-foreground">{req.device_name}</span>
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {req.uploaded_count} uploaded
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass rounded-xl p-4 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Image className="h-4 w-4" />
        Asset Requirements
      </h3>

      {/* Screenshots */}
      {(platform === "android" || platform === "both") &&
        renderScreenshotRequirements("android")}
      {(platform === "ios" || platform === "both") &&
        renderScreenshotRequirements("ios")}

      {/* Icons */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">App Icons</h4>
        <div className="grid grid-cols-2 gap-2">
          {(platform === "android" || platform === "both") && (
            <div
              className={cn(
                "flex items-center justify-between text-sm p-2 rounded-lg",
                status.icon.android ? "bg-green-500/10" : "bg-amber-500/10"
              )}
            >
              <span>Android (512x512)</span>
              {status.icon.android ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-amber-500" />
              )}
            </div>
          )}
          {(platform === "ios" || platform === "both") && (
            <div
              className={cn(
                "flex items-center justify-between text-sm p-2 rounded-lg",
                status.icon.ios ? "bg-green-500/10" : "bg-amber-500/10"
              )}
            >
              <span>iOS (1024x1024)</span>
              {status.icon.ios ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-amber-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feature Graphic (Android only) */}
      {(platform === "android" || platform === "both") && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Feature Graphic</h4>
          <div
            className={cn(
              "flex items-center justify-between text-sm p-2 rounded-lg",
              status.featureGraphic ? "bg-green-500/10" : "bg-amber-500/10"
            )}
          >
            <span>1024x500 (Android)</span>
            {status.featureGraphic ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-amber-500" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
