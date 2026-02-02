import { useState } from "react";
import { AssetUploader } from "./AssetUploader";
import { AssetGrid } from "./AssetGrid";
import { AssetPreviewModal } from "./AssetPreviewModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Smartphone, Tablet, Play, Apple } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useProjectAssets,
  useUploadAsset,
  useDeleteAsset,
  useUpdateAsset,
} from "@/hooks/useAppLaunch";
import {
  SCREENSHOT_REQUIREMENTS,
  type Platform,
  type ProjectAsset,
  type ScreenshotRequirement,
} from "@/api/types/appLaunch";

interface ScreenshotManagerProps {
  projectId: string;
  platforms: Platform[];
}

export function ScreenshotManager({ projectId, platforms }: ScreenshotManagerProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(
    platforms.includes("android") ? "android" : "ios"
  );
  const [selectedDevice, setSelectedDevice] = useState<string>("all");
  const [previewAsset, setPreviewAsset] = useState<ProjectAsset | null>(null);

  const { data: assets = [], isLoading } = useProjectAssets(projectId, {
    asset_type: "screenshot",
    platform: selectedPlatform,
    device_type: selectedDevice === "all" ? undefined : selectedDevice,
  });

  const uploadAsset = useUploadAsset();
  const deleteAsset = useDeleteAsset();
  const updateAsset = useUpdateAsset();

  const deviceTypes = SCREENSHOT_REQUIREMENTS.filter(
    (r) => r.platform === selectedPlatform
  );

  const currentDeviceReq = deviceTypes.find((d) => d.device_type === selectedDevice);

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        await uploadAsset.mutateAsync({
          project_id: projectId,
          asset_type: "screenshot",
          name: file.name.replace(/\.[^/.]+$/, ""),
          platform: selectedPlatform,
          device_type: selectedDevice === "all" ? deviceTypes[0]?.device_type : selectedDevice,
          file,
        });
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    toast.success(`${files.length} screenshot(s) uploaded`);
  };

  const handleDelete = async (assetId: string) => {
    if (confirm("Are you sure you want to delete this screenshot?")) {
      try {
        await deleteAsset.mutateAsync({ assetId, projectId });
        toast.success("Screenshot deleted");
      } catch {
        toast.error("Failed to delete screenshot");
      }
    }
  };

  const handleApprove = async (assetId: string, approved: boolean) => {
    try {
      await updateAsset.mutateAsync({ assetId, input: { is_approved: approved } });
      toast.success(approved ? "Screenshot approved" : "Screenshot unapproved");
    } catch {
      toast.error("Failed to update screenshot");
    }
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (!previewAsset) return;
    const currentIndex = assets.findIndex((a) => a.id === previewAsset.id);
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < assets.length) {
      setPreviewAsset(assets[newIndex]);
    }
  };

  const getRequirements = (req: ScreenshotRequirement) => ({
    minWidth: req.width - 100,
    maxWidth: req.width + 500,
    minHeight: req.height - 100,
    maxHeight: req.height + 500,
  });

  return (
    <div className="space-y-6">
      {/* Platform & Device Filter */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Platform Toggle */}
        {platforms.length > 1 && (
          <div className="flex rounded-lg border border-white/10 p-1">
            {platforms.includes("android") && (
              <Button
                variant={selectedPlatform === "android" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPlatform("android")}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Android
              </Button>
            )}
            {platforms.includes("ios") && (
              <Button
                variant={selectedPlatform === "ios" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPlatform("ios")}
                className="gap-2"
              >
                <Apple className="h-4 w-4" />
                iOS
              </Button>
            )}
          </div>
        )}

        {/* Device Type Filter */}
        <Select value={selectedDevice} onValueChange={setSelectedDevice}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All devices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All devices</SelectItem>
            {deviceTypes.map((device) => (
              <SelectItem key={device.device_type} value={device.device_type}>
                <div className="flex items-center gap-2">
                  {device.device_type.includes("tablet") ? (
                    <Tablet className="h-4 w-4" />
                  ) : (
                    <Smartphone className="h-4 w-4" />
                  )}
                  {device.device_name}
                  {device.required && (
                    <span className="text-xs text-amber-500">(required)</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Device Requirements Info */}
      {selectedDevice !== "all" && currentDeviceReq && (
        <div className="glass rounded-lg p-4 text-sm">
          <div className="flex flex-wrap items-center gap-4">
            <span>
              <strong>Size:</strong> {currentDeviceReq.width} x {currentDeviceReq.height}
            </span>
            <span>
              <strong>Max:</strong> {currentDeviceReq.max_count} screenshots
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                currentDeviceReq.required
                  ? "bg-amber-500/20 text-amber-500"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {currentDeviceReq.required ? "Required" : "Optional"}
            </span>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <AssetUploader
        projectId={projectId}
        assetType="screenshot"
        platform={selectedPlatform}
        deviceType={selectedDevice === "all" ? deviceTypes[0]?.device_type : selectedDevice}
        onUpload={handleUpload}
        isUploading={uploadAsset.isPending}
        requirements={currentDeviceReq ? getRequirements(currentDeviceReq) : undefined}
      />

      {/* Screenshots Grid */}
      <AssetGrid
        assets={assets}
        onPreview={setPreviewAsset}
        onDelete={handleDelete}
        onApprove={handleApprove}
        showApproval
        isLoading={isLoading}
        emptyMessage={`No ${selectedDevice === "all" ? "" : selectedDevice + " "}screenshots uploaded yet`}
      />

      {/* Preview Modal */}
      <AssetPreviewModal
        asset={previewAsset}
        assets={assets}
        open={!!previewAsset}
        onOpenChange={(open) => !open && setPreviewAsset(null)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
